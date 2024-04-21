// routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const pg =require("pg")
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
    // Add a student route
    router.create=async(req,res)=>{
        const { name, age ,email } = req.body;
        try {
            const client = await pool.connect();
            const result = await client.query('INSERT INTO students(name, age,email) VALUES($1, $2,$3) RETURNING *', [name, age,email]);
            const addedStudent = result.rows[0];
            client.release();
            res.status(201).json(addedStudent);
        } catch (err) {
            console.error('Error executing query', err);
            res.status(500).send('Error adding student');
        }
    }
    // Get all students route

    router.getallstudents=async(req,res)=>{
        const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit; // Calculate offset

    try {
        // Connect to the database
        const client = await pool.connect();

        // Execute the SQL query with pagination
        const result = await client.query('SELECT * FROM students ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]);
        
        // Retrieve the rows from the result
        const allStudents = result.rows;

        // Release the client back to the pool
        client.release();

        // Send the response with the paginated student data
        res.status(200).json(allStudents);
    } catch (err) {
        // Handle errors
        console.error('Error executing query', err);
        res.status(500).send('Error getting students');
    }
    }

    router.getstudentbyId=async(req,res)=>{
        try {
            const studentId  = req.params.id;
            const client = await pool.connect();
            const result = await client.query(`
                SELECT students.*, marks.*
                FROM students
                LEFT JOIN marks ON students.id = marks.student_id
                WHERE students.id = $1
            `, [studentId]);
            client.release();
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error retrieving student with marks:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    router.updatestudentbyId=async(req,res)=>{
        try {
            const  studentId  = req.params.id;
            const { name, age, email, marks } = req.body; // Assuming marks is an array of subjects and their corresponding marks
    
            // Update student information
            const client = await pool.connect();
            const studentResult = await client.query('UPDATE students SET name = $1, age = $2, email = $3 WHERE id = $4 RETURNING *', [name, age, email, studentId]);
            
            // Update marks
            if (marks && marks.length > 0) {
                for (const mark of marks) {
                    const { subject, mark_value } = mark;
                    await client.query(`
                        UPDATE marks 
                        SET ${subject} = $1 
                        WHERE student_id = $2
                    `, [mark_value, studentId]);
                }
            }
    
            client.release();
            
            res.status(200).json({
                student: studentResult.rows[0],
                message: 'Student information and marks updated successfully'
            });
        } catch (error) {
            console.error('Error updating student and marks:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    router.deletestudentbyId=async(req,res)=>{
        try {
            const  studentId  = req.params.id;
            const client = await pool.connect();
            await client.query('DELETE FROM students WHERE id = $1', [studentId]);
            client.release();
            res.status(204).send(); // No content
        } catch (error) {
            console.error('Error deleting student:', error);
            res.status(500).send('Internal Server Error');
        }
    }



    module.exports=router;
  

