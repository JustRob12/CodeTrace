const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Admin Login Logic
const loginAdmin = (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const admin = results[0];
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords' });
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '5s' });
            res.json({ token });
        });
    });
};

// Admin Registration Logic
const registerAdmin = async (req, res) => {
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
};

// Student Registration Logic
const registerStudent = (req, res) => {
    const { lastname, firstname, middlename, studentId, year, section, contactNumber } = req.body;
    const responses = [];

   
    if (!lastname || !firstname || !studentId || !year || !section || !contactNumber) {
        responses.push({ message: 'All fields are required' });
        return res.status(400).json(responses);
    }

 
    db.query(
        'INSERT INTO students (lastname, firstname, middlename, studentId, year, section, contactNumber) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [lastname, firstname, middlename, studentId, year, section, contactNumber], 
        (err) => {
            if (err) {
                console.error('Database error:', err);
                responses.push({ message: 'Error saving student' });
                return res.status(500).json(responses);
            }
            responses.push({ message: 'Student registered successfully' });
            res.status(201).json(responses);
        }
    );
};

// View Students Logic
const viewStudents = (req, res) => {
    const sql = 'SELECT studentId, firstname, lastname, middlename, year, section, contactNumber FROM students';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const students = results.map(student => ({
            studentId: student.studentId,
            firstname: student.firstname,
            lastname: student.lastname,
            middlename: student.middlename,
            year: student.year,
            section: student.section,
            contactNumber: student.contactNumber,
        }));

        res.status(200).json(students);
    });
};

// Delete Student Logic
const deleteStudent = (req, res) => {
    const { studentId } = req.params;
    const responses = [];

    db.query('DELETE FROM students WHERE studentId = ?', [studentId], (err, result) => {
        if (err) {
            responses.push({ message: 'Error deleting student' });
            return res.status(500).json(responses);
        }
        if (result.affectedRows === 0) {
            responses.push({ message: 'Student not found' });
            return res.status(404).json(responses);
        }
        responses.push({ message: 'Student deleted successfully' });
        res.status(200).json(responses);
    });
};

// Update Student Logic
const updateStudent = (req, res) => {
    const { studentId } = req.params;
    const { lastname, firstname, middlename, year, section, contactNumber } = req.body;
    const responses = [];

    if (!lastname || !firstname || !studentId || !year || !section || !contactNumber) {
        responses.push({ message: 'All fields are required' });
        return res.status(400).json(responses);
    }

    const sql = 'UPDATE students SET lastname = ?, firstname = ?, middlename = ?, year = ?, section = ?, contactNumber = ? WHERE studentId = ?';
    db.query(sql, [lastname, firstname, middlename, year, section, contactNumber, studentId], (err, result) => {
        if (err) {
            responses.push({ message: 'Error updating student' });
            return res.status(500).json(responses);
        }
        if (result.affectedRows === 0) {
            responses.push({ message: 'Student not found' });
            return res.status(404).json(responses);
        }
        responses.push({ message: 'Student updated successfully' });
        res.status(200).json(responses);
    });
};


    // Add Event Logic
    const addEvents = (req, res) => {
        const { event_name, event_description, event_start, event_end } = req.body;
        const responses = [];
    
        if (!event_name || !event_start || !event_end) {
            responses.push({ message: 'All fields are required' });
            return res.status(400).json(responses);
        }
    
        db.query(
            'INSERT INTO events (event_name, event_description, event_start, event_end) VALUES (?, ?, ?, ?)',
            [event_name, event_description, event_start, event_end],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    responses.push({ message: 'Error saving event' });
                    return res.status(500).json(responses);
                }
                responses.push({ message: 'Event added successfully' });
                res.status(201).json(responses);
            }
        );
    };
    
   
    
    
    // View Events Logic
    const viewEvents = (req, res) => {
        const sql = 'SELECT * FROM events';
        db.query(sql, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
    
            const events = results.map(event => ({
                id: event.id,
                title: event.event_name,
                description: event.event_description,
                start: event.event_start,
                end: event.event_end,
            }));
    
            res.status(200).json(events);
        });
    };
    
    
    // Delete Event Logic
    const deleteEvent = (req, res) => {
        const { id } = req.params;
        const responses = [];
    
        db.query('DELETE FROM events WHERE id = ?', [id], (err, result) => {
            if (err) {
                responses.push({ message: 'Error deleting event' });
                return res.status(500).json(responses);
            }
            if (result.affectedRows === 0) {
                responses.push({ message: 'Event not found' });
                return res.status(404).json(responses);
            }
            responses.push({ message: 'Event deleted successfully' });
            res.status(200).json(responses);
        });
    };
    




// Export all functions
module.exports = {
    loginAdmin,
    registerAdmin,
    registerStudent,
    viewStudents,
    deleteStudent,
    updateStudent,
    addEvents,
    viewEvents,
    deleteEvent,
};
