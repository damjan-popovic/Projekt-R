const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;

app.use(cors());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "ProjektR",
    password: "noodle",
    port: 5433,
});

app.get("/api/data", async (req, res) => {
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
            LEFT JOIN host h ON a.hostid = h.hostid;
        `;
        const result = await pool.query(query);
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