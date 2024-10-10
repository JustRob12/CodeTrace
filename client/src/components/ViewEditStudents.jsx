import axios from 'axios';
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code'; // Import QR code generator
import { useHistory, useParams } from 'react-router-dom';

const ViewEditStudent = () => {
    const { studentId } = useParams(); // Get studentId from URL params
    const history = useHistory(); // Use history for navigation
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        lastname: '',
        firstname: '',
        middlename: '',
        year: '',
        section: '',
        contactNumber: '',
        profilePicture: null
    });

    useEffect(() => {
        // Fetch student data
        const fetchStudentData = async () => {
            try {
                const response = await axios.get(`/api/students/${studentId}`);
                setStudent(response.data);
                setFormData(response.data); // Populate form with student data
                setLoading(false);
            } catch (err) {
                setError('Error fetching student data');
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            profilePicture: e.target.files[0]
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const form = new FormData();
        for (const key in formData) {
            form.append(key, formData[key]);
        }

        try {
            await axios.put(`/api/students/${studentId}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Student updated successfully');
            history.push('/students'); // Redirect after update
        } catch (err) {
            alert('Error updating student');
        }
    };

    const handleQRCode = () => {
        // Handle QR code action, like displaying or downloading
        alert('QR Code generated!'); // For demonstration
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!student) return <p>Student not found</p>;

    return (
        <div>
            <h2>View/Edit Student</h2>
            <form onSubmit={handleUpdate}>
                <div>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>First Name:</label>
                    <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Middle Name:</label>
                    <input
                        type="text"
                        name="middlename"
                        value={formData.middlename}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Year:</label>
                    <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Section:</label>
                    <input
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Contact Number:</label>
                    <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Profile Picture:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <button type="submit">Update Student</button>
            </form>

            <div>
                <h3>QR Code</h3>
                <QRCode value={JSON.stringify(student)} /> {/* Generates QR code from student data */}
                <button onClick={handleQRCode}>Generate QR Code</button>
            </div>
        </div>
    );
};

export default ViewEditStudent;
