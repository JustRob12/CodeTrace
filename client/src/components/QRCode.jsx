import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';

const StudentQRCode = ({ studentId }) => {
    const [studentName, setStudentName] = useState('');
    const qrCodeRef = useRef(null);

    useEffect(() => {
        // Fetch student data to get the name
        const fetchStudentData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/student/${studentId}`);
                const data = await response.json();
                setStudentName(`${data.firstname} ${data.lastname}`);
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
        };

        fetchStudentData();
    }, [studentId]);

    const downloadQRCode = () => {
        if (qrCodeRef.current) {
            html2canvas(qrCodeRef.current).then((canvas) => {
                const link = document.createElement('a');
                link.download = `${studentName}_QRCode.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] p-4">
            <div 
                ref={qrCodeRef} 
                className="bg-white p-8 rounded-lg shadow-md w-[280px] md:w-[320px] mx-auto flex flex-col items-center"
            >
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-[#0f8686]">
                    {studentName}
                </h2>
                <div className="mb-6">
                    <QRCode
                        value={studentId}
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                        level="H"
                    />
                </div>
                <p className="text-lg md:text-xl text-gray-600 text-center font-semibold">
                    Student ID: {studentId}
                </p>
            </div>
            
            <button
                onClick={downloadQRCode}
                className="mt-8 bg-[#0f8686] text-white px-6 py-2 rounded-lg hover:bg-[#0a6565] transition-colors duration-200 flex items-center space-x-2"
            >
                <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>
                <span>Download QR Code</span>
            </button>
        </div>
    );
};

export default StudentQRCode; 