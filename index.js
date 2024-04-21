const express = require('express');
require('dotenv').config();
const pg = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());

const studentRoutes = require("./routes/student.routes");
console.log(process.env.USER) , console.log(process.env.PASSWORD) 
// PostgreSQL configuration
const config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port:  14390, // Use DB_PORT if provided, otherwise default to 14390
    database: process.env.DATABASE,
    ssl: {
        rejectUnauthorized: false // For self-signed certificate
    }
};

const pool = new pg.Pool(config);

// Middleware to parse JSON bodies
app.use(express.json());

// Create students table if not exists
async function createTable() {
    try {
        const client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                age INT,
                email VARCHAR(255)
            )
        `);
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS marks (
                id SERIAL PRIMARY KEY,
                student_id INT,
                hindi INT,
                english INT,
                marathi INT,
                math INT,
                science INT,
                mark_date DATE,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        `);
        console.log('Students table created or already exists');
        client.release();
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error; // Rethrow the error for better error handling
    }
}

// Function to initialize database
async function initDatabase() {
    try {
        await createTable();
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1); // Exit the process with an error status
    }
}

initDatabase().then(() => {
    // Define routes
    app.use("/student", studentRoutes);

    // Start server
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(error => {
    console.error('Error initializing database:', error);
    process.exit(1); // Exit the process with an error status
});
