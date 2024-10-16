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

            const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    const { lastname, firstname, middlename, studentId, year, section, contactNumber, gmail } = req.body; // Include gmail
    const responses = [];

    // Check for required fields
    if (!lastname || !firstname || !studentId || !year || !section || !contactNumber || !gmail) { // Check for Gmail
        responses.push({ message: 'All fields are required' });
        return res.status(400).json(responses);
    }

    // Check if the studentId is already registered
    db.query(
        'SELECT * FROM students WHERE studentId = ?', 
        [studentId], 
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                responses.push({ message: 'Error checking student ID' });
                return res.status(500).json(responses);
            }

            // If a record is found, send an alert message
            if (results.length > 0) {
                responses.push({ message: 'Student ID is already registered' });
                return res.status(400).json(responses); // Return a 400 status with message
            }

            // Proceed to insert the new student record
            db.query(
                'INSERT INTO students (lastname, firstname, middlename, studentId, year, section, contactNumber, gmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                [lastname, firstname, middlename, studentId, year, section, contactNumber, gmail], 
                (insertErr) => {
                    if (insertErr) {
                        console.error('Database error:', insertErr);
                        responses.push({ message: 'Error saving student' });
                        return res.status(500).json(responses);
                    }
                    responses.push({ message: 'Student registered successfully' });
                    res.status(201).json(responses);
                }
            );
        }
    );
};


// View Students Logic
const viewStudents = (req, res) => {
    const sql = 'SELECT studentId, firstname, lastname, middlename, year, section, contactNumber, gmail FROM students'; // Include gmail
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
            gmail: student.gmail, // Include gmail
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
    // const checkIn = (req, res) => {
    //     const { studentId, eventId } = req.body;
    //     const checkInTime = new Date();
    
    //     // Validate if the student exists
    //     db.query('SELECT * FROM students WHERE studentId = ?', [studentId], (err, results) => {
    //         if (err) return res.status(500).json({ message: 'Database error during student validation' });
            
    //         if (results.length === 0) {
    //             return res.status(404).json({ message: 'Student not found. Please register first.' });
    //         }
    
    //         // Check if the student has already checked in for the event
    //         db.query('SELECT * FROM attendance WHERE studentId = ? AND event_id = ?', [studentId, eventId], (err, attendance) => {
    //             if (err) return res.status(500).json({ message: 'Database error during attendance check' });
                
    //             if (attendance.length > 0) {
    //                 return res.status(400).json({ message: 'Student already checked in for this event.' });
    //             }
    
    //             // Insert check-in record
    //             db.query(
    //                 'INSERT INTO attendance (studentId, checkInTime, event_id) VALUES (?, ?, ?)',
    //                 [studentId, checkInTime, eventId],
    //                 (err) => {
    //                     if (err) return res.status(500).json({ message: 'Error saving attendance' });
    //                     res.status(201).json({ message: 'Check-in successful', checkInTime });
    //                 }
    //             );
    //         });
    //     });
    // };

    const checkIn = (req, res) => {
        const { studentId, eventId } = req.body;
        const checkInTime = new Date();
    
        // Step 1: Validate if the student exists
        db.query('SELECT * FROM students WHERE studentId = ?', [studentId], (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error during student validation' });
    
            if (results.length === 0) {
                return res.status(404).json({ message: 'Student not found. Please register first.' });
            }
    
            // Step 2: Retrieve student's first name, middle name, and last name
            const { firstname, middlename, lastname, year } = results[0];
            console.log(`Found student: ${firstname} ${middlename || ''} ${lastname} ${year}`); // Log retrieved student names
    
            // Step 3: Check if the student has already checked in for the event
            db.query('SELECT * FROM attendance WHERE studentId = ? AND event_id = ?', [studentId, eventId], (err, attendance) => {
                if (err) return res.status(500).json({ message: 'Database error during attendance check' });
    
                if (attendance.length > 0) {
                    return res.status(400).json({ message: 'Student already checked in for this event.' });
                }
    
                // Step 4: Insert check-in record with names
                db.query(
                    'INSERT INTO attendance (studentId, firstname, middlename, lastname, year, checkInTime, event_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [studentId, firstname, middlename, lastname, year, checkInTime, eventId],
                    (err) => {
                        if (err) return res.status(500).json({ message: 'Error saving attendance' });
                        res.status(201).json({ message: 'Check-in successful', checkInTime });
                    }
                );
            });
        });
    };
    
    
    

// // Check Out Logic
// const checkOut = (req, res) => {
//     const { studentId, eventId } = req.body;
//     const checkOutTime = new Date();
//     console.log(studentId, eventId);
    
    
//     // Check if the student has checked in for this event
//     db.query('SELECT * FROM attendance WHERE studentId = ? AND event_id = ? AND checkOutTime IS NULL', [studentId, eventId], (err, results) => {
//         if (err) return res.status(500).json({ message: 'Database error' });
//         console.log(err);
        
        
//         // If the student hasn't checked in, return an error message
//         if (results.length === 0) {
//             return res.status(400).json({results, message: 'Check-out failed. Ensure you have checked in first.' });
//         }

//         // Update the check-out time
//         db.query('UPDATE attendance SET checkOutTime = ? WHERE studentId = ? AND event_id = ? AND checkOutTime IS NULL', [checkOutTime, studentId, eventId], (err, result) => {
//             if (err) return res.status(500).json({ message: 'Error updating attendance' });
//             if (result.affectedRows === 0) {
//                 return res.status(400).json({ message: 'Check-out failed. Ensure you have checked in first.' });
//             }
//             res.status(200).json({ message: 'Check-out successful', checkOutTime });
//         });
//     });
// };

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
    getStudentCountsByYear

};
