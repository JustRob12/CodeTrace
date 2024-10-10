const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Admin Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const admin = results[0];
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords' });
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

// Admin Registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [existingUser] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: 'Error saving user' });
            res.status(201).json({ message: 'Admin registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Student Registration
router.post('/registerStudent', upload.single('profilePicture'), (req, res) => {
    const { lastname, firstname, middlename, studentId, year, section, contactNumber } = req.body;
    const profilePicture = req.file ? req.file.buffer : null; // Get file buffer

    // Validate required fields
    if (!lastname || !firstname || !studentId || !year || !section || !contactNumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert student into the database
    db.query('INSERT INTO students (lastname, firstname, middlename, studentId, year, section, contactNumber, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [lastname, firstname, middlename, studentId, year, section, contactNumber, profilePicture], 
    (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving student' });
        }
        res.status(201).json({ message: 'Student registered successfully' });
    });
});

// View Students
router.get('/students', (req, res) => {
    const sql = 'SELECT studentId, firstname, lastname, middlename, year, section, contactNumber, profilePicture FROM students';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Convert BLOB data to base64 string for each student
        const students = results.map(student => ({
            ...student,
            profilePicture: student.profilePicture ? Buffer.from(student.profilePicture).toString('base64') : null
        }));

        res.status(200).json(students);
    });
});

// Delete Student
router.delete('/students/:studentId', (req, res) => {
    const { studentId } = req.params;

    db.query('DELETE FROM students WHERE studentId = ?', [studentId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting student' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    });
});

// Update Student
router.put('/students/:studentId', (req, res) => {
    const { studentId } = req.params;
    const { lastname, firstname, middlename, year, section, contactNumber } = req.body;

    // Validate required fields
    if (!lastname || !firstname || !studentId || !year || !section || !contactNumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Update query without profilePicture
    const sql = 'UPDATE students SET lastname = ?, firstname = ?, middlename = ?, year = ?, section = ?, contactNumber = ? WHERE studentId = ?';
    db.query(sql, [lastname, firstname, middlename, year, section, contactNumber, studentId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating student' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student updated successfully' });
    });
});


module.exports = router;
