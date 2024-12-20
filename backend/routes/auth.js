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
    deleteEvent,
    checkIn,
    checkOut,
    viewAttendance,
    getAttendanceReports,
    getStudentCountsByYear,
    loginStudent,
    getStudentData,
    getStudentAttendance,
    getAdmins,
    updateAdmin,
    deleteAdmin,
    changeStudentPassword,
    forgotPassword
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

// Check In Route
router.post('/attendance/checkin', checkIn);

// Check Out Route
router.post('/attendance/checkout', checkOut);

// View Attendance Route
router.get('/attendance', viewAttendance);

router.get('/reports', getAttendanceReports);

router.get('/counts', getStudentCountsByYear);

router.post('/login/student', loginStudent);
router.get('/student/:studentId', getStudentData);

// Add this new route
router.get('/student/attendance/:studentId', getStudentAttendance);

router.get('/admins', getAdmins);
router.put('/admin/:id', updateAdmin);
router.delete('/admin/:id', deleteAdmin);

// Add this new route for changing password
router.post('/change-password', changeStudentPassword);

// Add this new route for forgot password
router.post('/forgot-password', forgotPassword);

module.exports = router;
