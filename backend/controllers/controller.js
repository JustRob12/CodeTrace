const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Add these encryption helper functions at the top of your file
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'your-secret-key', 'salt', 32);
const IV_LENGTH = 16;

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// Add this helper function at the top of your file
const generatePassword = (student) => {
    // Take first 2 letters of firstname (uppercase)
    const namePart = student.firstname.substring(0, 2).toUpperCase();
    // Take last 4 digits of studentId
    const idPart = student.studentId.slice(-4);
    // Take year
    const yearPart = student.year;
    // Generate 3 random characters
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    // Combine all parts to create a 10-character password
    return `${namePart}${idPart}${yearPart}${randomPart}`;
};

// Admin Login Logic
const loginAdmin = (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = results[0];
        
        try {
            const isMatch = await bcrypt.compare(password, admin.password);
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: admin.id, type: 'admin' },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1h' }
            );

            res.json({ 
                token,
                userType: 'admin'
            });
        } catch (error) {
            console.error('Password comparison error:', error);
            return res.status(500).json({ message: 'Error comparing passwords' });
        }
    });
};

// Admin Registration Logic
const registerAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if admin already exists
        const [existingAdmin] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        if (existingAdmin) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new admin
        db.query(
            'INSERT INTO admins (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Error saving admin' });
                }
                res.status(201).json({ message: 'Admin registered successfully' });
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Student Registration Logic
const registerStudent = (req, res) => {
    const { lastname, firstname, middlename, studentId, year, section, contactNumber, gmail } = req.body;
    const responses = [];

    if (!lastname || !firstname || !studentId || !year || !section || !contactNumber || !gmail) {
        responses.push({ message: 'All fields are required' });
        return res.status(400).json(responses);
    }

    db.query(
        'SELECT * FROM students WHERE studentId = ?', 
        [studentId], 
        async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                responses.push({ message: 'Error checking student ID' });
                return res.status(500).json(responses);
            }

            if (results.length > 0) {
                responses.push({ message: 'Student ID is already registered' });
                return res.status(400).json(responses);
            }

            try {
                // Generate password
                const generatedPassword = generatePassword({ firstname, studentId, year });
                
                // Encrypt the password
                const encryptedPassword = encrypt(generatedPassword);

                // First, insert into students table
                db.query(
                    'INSERT INTO students (lastname, firstname, middlename, studentId, year, section, contactNumber, gmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                    [lastname, firstname, middlename, studentId, year, section, contactNumber, gmail], 
                    (insertErr) => {
                        if (insertErr) {
                            console.error('Database error:', insertErr);
                            responses.push({ message: 'Error saving student' });
                            return res.status(500).json(responses);
                        }

                        // Then, insert into student_accounts table
                        db.query(
                            'INSERT INTO student_accounts (studentId, username, password) VALUES (?, ?, ?)',
                            [studentId, studentId, encryptedPassword],
                            (accountErr) => {
                                if (accountErr) {
                                    console.error('Database error:', accountErr);
                                    responses.push({ message: 'Error creating student account' });
                                    return res.status(500).json(responses);
                                }

                                responses.push({ 
                                    message: 'Student registered successfully',
                                    credentials: {
                                        username: studentId,
                                        password: generatedPassword // Send the unencrypted password in response
                                    }
                                });
                                res.status(201).json(responses);
                            }
                        );
                    }
                );
            } catch (error) {
                console.error('Registration error:', error);
                responses.push({ message: 'Error registering student' });
                res.status(500).json(responses);
            }
        }
    );
};

// View Students Logic
const viewStudents = (req, res) => {
    const sql = `
        SELECT s.*, sa.password as encrypted_password
        FROM students s
        LEFT JOIN student_accounts sa ON s.studentId = sa.studentId
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }

        const studentsWithCredentials = results.map(student => ({
            ...student,
            credentials: {
                username: student.studentId,
                password: student.encrypted_password ? decrypt(student.encrypted_password) : 'Not set'
            }
        }));

        res.status(200).json(studentsWithCredentials);
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
    const { lastname, firstname, middlename, year, section, contactNumber, gmail } = req.body; // Include gmail
    const responses = [];

    if (!lastname || !firstname || !studentId || !year || !section || !contactNumber || !gmail) { // Check for Gmail
        responses.push({ message: 'All fields are required' });
        return res.status(400).json(responses);
    }

    const sql = 'UPDATE students SET lastname = ?, firstname = ?, middlename = ?, year = ?, section = ?, contactNumber = ?, gmail = ? WHERE studentId = ?'; // Include gmail in update
    db.query(sql, [lastname, firstname, middlename, year, section, contactNumber, gmail, studentId], (err, result) => {
        if (err) {
            console.error('Database error:', err); // Log the error
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

// Check In Logic
const checkIn = (req, res) => {
    const { studentId, eventId } = req.body;
    const checkInTime = new Date();
    
    // Step 1: Validate if the student exists
    db.query('SELECT * FROM students WHERE studentId = ?', [studentId], (err, results) => {
        if (err) {
            console.error('Database error during student validation:', err); // Log error
            return res.status(500).json({ message: 'Database error during student validation' });
        }
    
        if (results.length === 0) {
            return res.status(404).json({ message: 'Student not found. Please register first.' });
        }
    
        // Step 2: Retrieve student's first name, middle name, and last name
        const { firstname, middlename, lastname, year } = results[0];
        console.log(`Found student: ${firstname} ${middlename || ''} ${lastname} ${year}`); // Log retrieved student names
    
        // Step 3: Check if the student has already checked in for the event
        db.query('SELECT * FROM attendance WHERE studentId = ? AND event_id = ?', [studentId, eventId], (err, attendance) => {
            if (err) {
                console.error('Database error during attendance check:', err); // Log error
                return res.status(500).json({ message: 'Database error during attendance check' });
            }
    
            if (attendance.length > 0) {
                return res.status(400).json({ message: 'Student already checked in for this event.' });
            }
    
            // Step 4: Insert check-in record with names
            db.query(
                'INSERT INTO attendance (studentId, firstname, middlename, lastname, year, checkInTime, event_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [studentId, firstname, middlename, lastname, year, checkInTime, eventId],
                (err) => {
                    if (err) {
                        console.error('Error saving attendance:', err); // Log error
                        return res.status(500).json({ message: 'Error saving attendance' });
                    }
                    res.status(201).json({ message: 'Check-in successful', checkInTime });
                }
            );
        });
    });
};

// Check Out Logic
const checkOut = (req, res) => {
    const { studentId, eventId } = req.body;
    const checkOutTime = new Date();

    // Check if the student has checked in for this event
    db.query('SELECT * FROM attendance WHERE studentId = ? AND event_id = ? AND checkOutTime IS NULL', [studentId, eventId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        // If the student hasn't checked in, return an error message
        if (results.length === 0) {
            return res.status(400).json({ message: 'Check-out failed. Ensure you have checked in first.' });
        }

        // Update the check-out time
        db.query('UPDATE attendance SET checkOutTime = ? WHERE studentId = ? AND event_id = ? AND checkOutTime IS NULL', [checkOutTime, studentId, eventId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error updating attendance' });
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Check-out failed. Ensure you have checked in first.' });
            }
            res.status(200).json({ message: 'Check-out successful', checkOutTime });
        });
    });
};

// View Attendance Logic
const viewAttendance = (req, res) => {
    const sql = `
        SELECT a.*, s.firstName, s.middleName, s.lastName 
        FROM attendance a 
        JOIN students s ON a.studentId = s.studentId
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(200).json(results);
    });
};

const getAttendanceReports = (req, res) => {
    const sql = `
        SELECT a.*, s.firstname, s.middlename, s.lastname 
        FROM attendance a 
        JOIN students s ON a.studentId = s.studentId`; // Assuming studentId in attendance matches id in students table

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getStudentCountsByYear = (req, res) => {
    const sql = `
        SELECT year, COUNT(*) AS studentCount 
        FROM students 
        GROUP BY year
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        const countsByYear = results.map(row => ({
            year: row.year,
            count: row.studentCount
        }));

        res.status(200).json(countsByYear);
    });
};

// Student Login Logic
const loginStudent = (req, res) => {
    const { username, password } = req.body;
    db.query(
        'SELECT s.*, sa.password as encrypted_password FROM students s JOIN student_accounts sa ON s.studentId = sa.studentId WHERE sa.username = ?',
        [username],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

            const student = results[0];
            const decryptedPassword = decrypt(student.encrypted_password);
            
            if (password !== decryptedPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: student.studentId, type: 'student' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            res.json({ 
                token,
                userType: 'student',
                studentId: student.studentId
            });
        }
    );
};

// Get Student Data
const getStudentData = (req, res) => {
    const { studentId } = req.params;
    
    db.query(
        'SELECT * FROM students WHERE studentId = ?',
        [studentId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(404).json({ message: 'Student not found' });
            
            res.json(results[0]);
        }
    );
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
    checkIn,
    checkOut,
    viewAttendance,
    getAttendanceReports,
    getStudentCountsByYear,
    loginStudent,
    getStudentData

};
