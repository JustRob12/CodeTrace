const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const crypto = require('crypto');
const { logAdminActivity } = require('../utils/logger');

// Add these encryption helper functions at the top of your file
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'your-secret-key', 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

// Encryption function
const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

// Decryption function
const decrypt = (text) => {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
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
    const ipAddress = req.ip || req.connection.remoteAddress;
    
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

            // Log the successful login
            await logAdminActivity(
                admin.admin_id,
                'LOGIN',
                null,
                'Admin logged in successfully',
                ipAddress
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
    const { studentId, firstName, middleName, lastName, position, username, password } = req.body;

    try {
        // Check if username already exists
        const [existingAdmin] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
                if (err) reject(err);
                resolve([results]);
            });
        });

        if (existingAdmin && existingAdmin.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if student ID already exists
        const [existingStudentId] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM admins WHERE student_id = ?', [studentId], (err, results) => {
                if (err) reject(err);
                resolve([results]);
            });
        });

        if (existingStudentId && existingStudentId.length > 0) {
            return res.status(400).json({ message: 'Student ID already registered as admin' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new admin
        await new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO admins (student_id, first_name, middle_name, last_name, position, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [studentId, firstName, middleName, lastName, position, username, hashedPassword],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error registering admin',
            error: error.message 
        });
    }
};

// Student Registration Logic
const registerStudent = (req, res) => {
    const { lastname, firstname, middlename, studentId, year, section, contactNumber, gmail, password } = req.body;
    const responses = [];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const adminId = req.user ? req.user.id : null; // Assuming you have middleware that sets req.user

    if (!lastname || !firstname || !studentId || !year || !section || !contactNumber || !gmail || !password) {
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
                // Encrypt the one-time password
                const encryptedPassword = encrypt(password);

                // First, insert into students table
                db.query(
                    'INSERT INTO students (lastname, firstname, middlename, studentId, year, section, contactNumber, gmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                    [lastname, firstname, middlename, studentId, year, section, contactNumber, gmail], 
                    async (insertErr) => {
                        if (insertErr) {
                            console.error('Database error:', insertErr);
                            responses.push({ message: 'Error saving student' });
                            return res.status(500).json(responses);
                        }

                        // Then, insert into student_accounts table with isFirstLogin set to true
                        db.query(
                            'INSERT INTO student_accounts (studentId, username, password, isFirstLogin) VALUES (?, ?, ?, TRUE)',
                            [studentId, studentId, encryptedPassword],
                            async (accountErr) => {
                                if (accountErr) {
                                    console.error('Database error:', accountErr);
                                    responses.push({ message: 'Error creating student account' });
                                    return res.status(500).json(responses);
                                }

                                // Log the student creation
                                if (adminId) {
                                    await logAdminActivity(
                                        adminId,
                                        'CREATE_STUDENT',
                                        studentId,
                                        `Created student: ${firstname} ${lastname}`,
                                        ipAddress
                                    );
                                }

                                responses.push({ 
                                    message: 'Student registered successfully',
                                    credentials: {
                                        username: studentId,
                                        password: password // Send back the original one-time password
                                    }
                                });
                                res.status(201).json(responses);
                            }
                        );
                    }
                );
            } catch (error) {
                console.error('Registration error:', error);
                responses.push({ message: 'Server error' });
                res.status(500).json(responses);
            }
        }
    );
};

// Delete Student Logic
const deleteStudent = async (req, res) => {
    const { studentId } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const adminId = req.user ? req.user.id : null;

    try {
        // Get student details before deletion for logging
        const [student] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM students WHERE studentId = ?', [studentId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete the student
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM students WHERE studentId = ?', [studentId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // Log the deletion
        if (adminId) {
            await logAdminActivity(
                adminId,
                'DELETE_STUDENT',
                studentId,
                `Deleted student: ${student.firstname} ${student.lastname}`,
                ipAddress
            );
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student' });
    }
};

// Update Student Logic
const updateStudent = async (req, res) => {
    const { studentId } = req.params;
    const updates = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const adminId = req.user ? req.user.id : null;

    try {
        // Update the student
        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE students SET ? WHERE studentId = ?',
                [updates, studentId],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Log the update
        if (adminId) {
            await logAdminActivity(
                adminId,
                'UPDATE_STUDENT',
                studentId,
                `Updated student information: ${JSON.stringify(updates)}`,
                ipAddress
            );
        }

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student' });
    }
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

// Add Event Logic
const addEvents = (req, res) => {
    const { event_name, event_description, event_start, event_end } = req.body;
    const responses = [];
    
    // Basic validation
    if (!event_name || !event_start || !event_end) {
        responses.push({ message: 'Event name, start date, and end date are required' });
        return res.status(400).json(responses);
    }

    // Date validation
    const startDate = new Date(event_start);
    const endDate = new Date(event_end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        responses.push({ message: 'Invalid date format' });
        return res.status(400).json(responses);
    }

    if (endDate < startDate) {
        responses.push({ message: 'End date cannot be before start date' });
        return res.status(400).json(responses);
    }

    // Convert event_description to NULL if it's an empty string
    const description = event_description || null;
    
    const sql = 'INSERT INTO events (event_name, event_description, event_start, event_end) VALUES (?, ?, ?, ?)';
    
    db.query(
        sql,
        [event_name, description, startDate, endDate],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                responses.push({ message: 'Error saving event', error: err.message });
                return res.status(500).json(responses);
            }
            
            responses.push({ 
                message: 'Event added successfully',
                eventId: result.insertId 
            });
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
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const adminId = req.user ? req.user.id : null;

    try {
        // Get event details before deletion for logging
        const [event] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM events WHERE id = ?', [id], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Delete the event
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM events WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // Log the event deletion
        if (adminId) {
            await logAdminActivity(
                adminId,
                'DELETE_EVENT',
                id,
                `Deleted event: ${event.name}`,
                ipAddress
            );
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
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
const loginStudent = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Get student account
        const [account] = await new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM student_accounts WHERE username = ?',
                [username],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        if (!account) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Decrypt stored password
        const decryptedPassword = decrypt(account.password);
        
        // Compare passwords
        if (password !== decryptedPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get student details
        const [student] = await new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM students WHERE studentId = ?',
                [username],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        // Generate token
        const token = jwt.sign(
            { studentId: student.studentId },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            studentId: student.studentId,
            isFirstLogin: account.isFirstLogin
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
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

// Add this new controller function
const getStudentAttendance = (req, res) => {
    const { studentId } = req.params;
    
    // Updated SQL query to get event_name instead of title
    const sql = `
        SELECT 
            a.*,
            e.event_name
        FROM attendance a
        LEFT JOIN events e ON a.event_id = e.id
        WHERE a.studentId = ?
        ORDER BY a.checkInTime DESC
    `;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                message: 'Error fetching attendance history',
                error: err.message,
                sqlMessage: err.sqlMessage
            });
        }

        // Log the results for debugging
        console.log('Attendance records found:', results.length);
        
        res.status(200).json(results);
    });
};

// Get all admins
const getAdmins = async (req, res) => {
    try {
        const [admins] = await new Promise((resolve, reject) => {
            db.query(
                'SELECT admin_id, student_id, first_name, middle_name, last_name, position, username, created_at, updated_at FROM admins',
                (err, results) => {
                    if (err) reject(err);
                    resolve([results]);
                }
            );
        });

        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ 
            message: 'Error fetching admins',
            error: error.message 
        });
    }
};

// Update admin
const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { studentId, firstName, middleName, lastName, position, username, password } = req.body;

    try {
        // Check if username already exists for other admins
        const [existingAdmin] = await new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM admins WHERE username = ? AND admin_id != ?', 
                [username, id], 
                (err, results) => {
                    if (err) reject(err);
                    resolve([results]);
                }
            );
        });

        if (existingAdmin && existingAdmin.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        let updateQuery = `
            UPDATE admins 
            SET student_id = ?, 
                first_name = ?, 
                middle_name = ?, 
                last_name = ?, 
                position = ?, 
                username = ?
        `;
        let queryParams = [studentId, firstName, middleName, lastName, position, username];

        // Only update password if it's provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += ', password = ?';
            queryParams.push(hashedPassword);
        }

        updateQuery += ' WHERE admin_id = ?';
        queryParams.push(id);

        await new Promise((resolve, reject) => {
            db.query(updateQuery, queryParams, (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        res.json({ message: 'Admin updated successfully' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ 
            message: 'Error updating admin',
            error: error.message 
        });
    }
};

// Delete admin
const deleteAdmin = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM admins WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error deleting admin' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ message: 'Admin deleted successfully' });
    });
};

// Add new function to change password
const changeStudentPassword = async (req, res) => {
    const { studentId, newPassword } = req.body;

    try {
        // Hash the new password
        const encryptedPassword = encrypt(newPassword);

        // Update password and set isFirstLogin to false
        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE student_accounts SET password = ?, isFirstLogin = FALSE WHERE studentId = ?',
                [encryptedPassword, studentId],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    const { studentId, newPassword } = req.body;

    try {
        // Encrypt the new password
        const encryptedPassword = encrypt(newPassword);

        // Update the password in the database
        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE student_accounts SET password = ?, isFirstLogin = TRUE WHERE studentId = ?',
                [encryptedPassword, studentId],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
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
    getStudentData,
    getStudentAttendance,
    getAdmins,
    updateAdmin,
    deleteAdmin,
    changeStudentPassword,
    forgotPassword,
};
