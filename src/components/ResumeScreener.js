import React, { useState } from 'react';
import axios from 'axios';
import FileUploader from '../components/FileUploader';

function ResumeScreener() {
    const [response, setResponse] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpload = async (formData) => {
        setIsLoading(true);
        try {
            const res = await axios.post('http://localhost:5011/ats/resume/parser/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("resposne received "+JSON.stringify(res.data.metadata));

            setResponse(res.data.metadata); // Directly use the response data
        } catch (error) {
            console.error('Error uploading file:', error);
            setResponse({ error: 'Failed to upload file.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
            const formData = new FormData();
            formData.append('file', file);
            handleUpload(formData);
        }
    };

    const getRatingColor = (rating) => {
        let color = 'gray';
        if (rating >= 1 && rating <= 4) {
            color = '#FF6347';
        } else if (rating >= 5 && rating <= 7) {
            color = '#FFBF00';
        } else if (rating >= 8 && rating <= 10) {
            color = '#32CD32';
        }
        return color;
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'row',
        padding: '20px',
        gap: '20px',
    };

    const sectionStyle = {
        flex: 1,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        padding: '20px',
        overflow: 'auto',
        height: '800px',
    };

    return (
        <div className="App" style={{ margin: '20px' }}>
            <style>
                {`
                    .loader {
                        border: 6px solid #f3f3f3;
                        border-top: 6px solid #3498db;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 2s linear infinite;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <FileUploader onFileChange={handleFileChange} />
            <div style={containerStyle}>
                <div style={{ ...sectionStyle, marginRight: '20px' }}>
                    {pdfUrl && <iframe title="PDF Viewer" src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>}
                </div>
                <div style={sectionStyle}>
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <div className="loader"></div>
                        </div>
                    ) : (
                        response && (
                            <div>
                                <h4>Personal Info</h4>
                                <p>Name: {response.personal_info?.name}</p>
                                <p>Email: {response.personal_info?.email}</p>
                                <p>Phone Number: {response.personal_info?.phone_number}</p>
                                <p>Current City: {response.personal_info?.current_city}</p>
                                <h4>Strengths</h4>
                                <p>{response.strengths}</p>
                                <h4>Weakness</h4>
                                <p>{response.weakness}</p>
                                <h4>Risk Rating</h4>
                                <p style={{ color: getRatingColor(response.risk_rating), fontWeight: 'bold' }}>{response.risk_rating}</p>
                                <h4>Total Experience</h4>
                                <p>{response.total_experience}</p>
                                <h4>Experience Summary</h4>
                                {response.experience_summary?.map((exp, index) => (
                                    <div key={index}>
                                        <p> {exp.company} : ({exp.start_year} - {exp.end_year}): {exp.role}</p>
                                    </div>
                                ))}
                                <h4>Education Summary</h4>
                                <p>{response.education_summary?.degree}, {response.education_summary?.institution}</p>
                                <h4>Recent Skills</h4>
                                {response.recent_skills?.map((skill, index) => (
                                    <span key={index} style={{ display: 'inline-block', margin: '5px', padding: '5px 10px', background: '#00FFFF', borderRadius: '20px', fontSize: '14px' }}>{skill}</span>
                                ))}
                                
                                <h4>Skills</h4>
                                {response.skills?.map((skill, index) => (
                                    <span key={index} style={{ display: 'inline-block', margin: '5px', padding: '5px 10px', background: '#f0f0f0', borderRadius: '20px', fontSize: '14px' }}>{skill}</span>
                                ))}

                                <h4>Skillwise Experience</h4>
                                    <div>
                                        {Object.entries(response.skillwise_experience || {}).map(([skill, experience], index) => (
                                            <div key={index} style={{ marginBottom: '10px' }}>
                                                <strong>{skill}:</strong> {experience}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                    
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
export default ResumeScreener;
