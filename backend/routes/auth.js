const express = require('express');
const multer = require('multer');
const {
    loginAdmin,
    registerAdmin,
    registerStudent,
    viewStudents,
    deleteStudent,
    updateStudent,
    addEvents,
    viewEvents,
    deleteEvent, // Import the new addEvent function
} = require('../controllers/controller');

const router = express.Router();

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Admin Login Route
router.post('/login', loginAdmin);

// Admin Registration Route
router.post('/register', registerAdmin);

// Student Registration Route
router.post('/registerStudent', registerStudent);

// View Students Route
router.get('/students', viewStudents);

// Delete Student Route
router.delete('/students/:studentId', deleteStudent);

// Update Student Route
router.put('/students/:studentId', updateStudent);
// Add Event Route

router.post('/event', addEvents);

// Get Events Route
router.get('/events', viewEvents);

// Delete Event Route
router.delete('/event/:id', deleteEvent);


module.exports = router;
