const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());
const port = 3000;

app.use(cors({
    origin: 'https://isohr.onrender.com', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.set('trust proxy', 1);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
    },
});

app.post("/api/data", async (req, res) => {
    const { selectedCounty, selectedSubregion, d_price, g_price, d_rooms, g_rooms, d_capacity, g_capacity, d_beds, g_beds, d_baths, g_baths, d_arating, g_arating, d_hrating, g_hrating } = req.body;
    try {
        let result = [];
        let query;
        if (selectedSubregion === 'nijedno' && selectedCounty === 'nijedno'){
            query = `
            SELECT 
                a.accommodationid, 
                a.name AS acc_name,
                a.price,
                a.numofrooms, 
                a.capacity, 
                a.numofbeds, 
                a.numofbathrooms, 
                a.accrating, 
                l.geolength AS latitude, 
                l.geowidth AS longitude,
                h.hostname, 
                h.hostsurname, 
                h.hostrating
            FROM accommodation a
            LEFT JOIN location l ON a.accommodationid = l.accommodationid
            LEFT JOIN host h ON a.hostid = h.hostid
			WHERE 
			CAST(REPLACE(REPLACE(a.price, 'Nema cijene', '0'), '€', '') AS INTEGER) between $1 and $2 AND
			a.numofrooms between $3 and $4 AND
			a.capacity between $5 and $6 AND
			a.numofbeds between $7 and $8 AND
			a.numofbathrooms between $9 and $10 AND
			CAST(REPLACE(REPLACE(a.accrating, 'Nema', '0'), ',', '.') AS DECIMAL) between $11 and $12 AND
			CAST(REPLACE(REPLACE(h.hostrating, 'Nema ocjene', '0'), ',', '.') AS DECIMAL) between $13 and $14;
            `
        values = [d_price, g_price, d_rooms, g_rooms, d_capacity, g_capacity, d_beds, g_beds, d_baths, g_baths, d_arating, g_arating, d_hrating, g_hrating];
        result = await pool.query(query, values);
        } else if (selectedCounty !== 'nijedno' && selectedSubregion === 'nijedno') {
            query = `
            SELECT 
                a.accommodationid, 
                a.name AS acc_name,
                a.price,
                a.numofrooms, 
                a.capacity, 
                a.numofbeds, 
                a.numofbathrooms, 
                a.accrating, 
                l.geolength AS latitude, 
                l.geowidth AS longitude,
                l.županija,
                h.hostname, 
                h.hostsurname, 
                h.hostrating
            FROM accommodation a
            LEFT JOIN location l ON a.accommodationid = l.accommodationid
            LEFT JOIN host h ON a.hostid = h.hostid
            WHERE 
            CAST(REPLACE(REPLACE(a.price, 'Nema cijene', '0'), '€', '') AS INTEGER) between $1 and $2 AND
            a.numofrooms between $3 and $4 AND
            a.capacity between $5 and $6 AND
            a.numofbeds between $7 and $8 AND
            a.numofbathrooms between $9 and $10 AND
            CAST(REPLACE(REPLACE(a.accrating, 'Nema', '0'), ',', '.') AS DECIMAL) between $11 and $12 AND
            CAST(REPLACE(REPLACE(h.hostrating, 'Nema ocjene', '0'), ',', '.') AS DECIMAL) between $13 and $14 AND
            l.županija = $15;
            `
    values = [d_price, g_price, d_rooms, g_rooms, d_capacity, g_capacity, d_beds, g_beds, d_baths, g_baths, d_arating, g_arating, d_hrating, g_hrating, `${selectedCounty} županija`];
    result = await pool.query(query, values);
        } else if (selectedCounty !== 'nijedno' && selectedSubregion !== 'nijedno') {
            query = `
            SELECT 
                a.accommodationid, 
                a.name AS acc_name,
                a.price,
                a.numofrooms, 
                a.capacity, 
                a.numofbeds, 
                a.numofbathrooms, 
                a.accrating, 
                l.geolength AS latitude, 
                l.geowidth AS longitude,
                l.županija,
                l.grad,
                h.hostname, 
                h.hostsurname, 
                h.hostrating
            FROM accommodation a
            LEFT JOIN location l ON a.accommodationid = l.accommodationid
            LEFT JOIN host h ON a.hostid = h.hostid
            WHERE 
            CAST(REPLACE(REPLACE(a.price, 'Nema cijene', '0'), '€', '') AS INTEGER) between $1 and $2 AND
            a.numofrooms between $3 and $4 AND
            a.capacity between $5 and $6 AND
            a.numofbeds between $7 and $8 AND
            a.numofbathrooms between $9 and $10 AND
            CAST(REPLACE(REPLACE(a.accrating, 'Nema', '0'), ',', '.') AS DECIMAL) between $11 and $12 AND
            CAST(REPLACE(REPLACE(h.hostrating, 'Nema ocjene', '0'), ',', '.') AS DECIMAL) between $13 and $14 AND
            l.županija = $15 AND l.grad = $16;
        `
        values = [d_price, g_price, d_rooms, g_rooms, d_capacity, g_capacity, d_beds, g_beds, d_baths, g_baths, d_arating, g_arating, d_hrating, g_hrating, selectedCounty + ' županija', selectedSubregion];
        result = await pool.query(query, values);
    }

        res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch data from the database" });
    }
});

app.get("/api/countyAverages", async (req, res) => {
    try {
        const query = `
                SELECT 
                l.županija,
                AVG(CAST(REPLACE(a.price, '€', '') AS INTEGER)) AS avg_price,
                AVG(CAST(REPLACE(a.accrating, ',', '.') AS DECIMAL)) AS avg_rating
                FROM accommodation a natural join location l
                WHERE a.price != 'Nema cijene' AND a.accrating != 'Nema'
                GROUP BY l.županija;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch averages" });
    }
});

app.get("/api/subregionAverages", async (req, res) => {
    try {
        const query = `
                SELECT 
                l.grad,
                AVG(CAST(REPLACE(a.price, '€', '') AS INTEGER)) AS avg_price,
                AVG(CAST(REPLACE(a.accrating, ',', '.') AS DECIMAL)) AS avg_rating
                FROM accommodation a natural join location l
                WHERE a.price != 'Nema cijene' AND a.accrating != 'Nema'
                GROUP BY l.grad;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch averages" });
    }
});

const path = require("path");
const clientPath = path.join(__dirname, "client");
app.use(express.static(clientPath));
app.use("/static", express.static(path.join(clientPath, "static")));

app.get("/", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});