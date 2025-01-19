const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
const port = 3000;

app.use(cors());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "ProjektR",
    password: "noodle",
    port: 5433,
});

app.post("/api/data", async (req, res) => {
    const { d_price, g_price, d_rooms, g_rooms, d_capacity, g_capacity, d_beds, g_beds, d_baths, g_baths, d_arating, g_arating, d_hrating, g_hrating } = req.body;
    try {
        const query = `
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
			CAST(REPLACE(a.price, '€', '') AS INTEGER) between $1 and $2 AND
			a.numofrooms between $3 and $4 AND
			a.capacity between $5 and $6 AND
			a.numofbeds between $7 and $8 AND
			a.numofbathrooms between $9 and $10 AND
			CAST(REPLACE(REPLACE(a.accrating, 'Nema', '0'), ',', '.') AS DECIMAL) between $11 and $12 AND
			CAST(REPLACE(REPLACE(h.hostrating, 'Nema ocjene', '0'), ',', '.') AS DECIMAL) between $13 and $14;
        `
        values = [d_price, g_price, d_rooms, g_rooms, d_capacity, g_capacity, d_beds, g_beds, d_baths, g_baths, d_arating, g_arating, d_hrating, g_hrating ];
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch data from the database" });
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