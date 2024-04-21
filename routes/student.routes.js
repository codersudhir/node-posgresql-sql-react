// routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const {create, getallstudents, getstudentbyId, updatestudentbyId, deletestudentbyId } = require('../controllers/student.controller');

// Routes for CRUD operations
router.post("/addstudent",create)

router.get("/getallstudents",getallstudents)

router.get("/getstudentbyId/:id",getstudentbyId)

router.post("/updatestudentbyid/:id",updatestudentbyId) 

router.delete("/deletestudebyid/:id",deletestudentbyId)

module.exports = router;