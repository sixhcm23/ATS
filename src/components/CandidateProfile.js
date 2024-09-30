import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CandidateProfile() {
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
            console.log("response received " + JSON.stringify(res.data));
            setResponse(res.data);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error("Unable to parse Resume. Please try again. If problem persists, please inform the administrator.");
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

    const handleIndexResume = async () => {
        if (response) {
            try {
                const email = response?.metadata?.personal_info?.email || "unknown"; // Extract email as candidate_id
                const skills = response?.metadata?.skills || []; // Extract skills from metadata
                const experience = response?.metadata?.total_experience || "N/A"; // Extract total experience

                const requestBody = {
                    candidate_id: email, // Add candidate_id from email
                    skills: skills, // Add skills
                    experience: experience, // Add total experience
                };

                // Send POST request to /assessment/generate
                const res = await axios.post('http://127.0.0.1:5011/assessment/generate', requestBody);

                if (res.status >= 200 && res.status < 300) {
                    toast.success('Resume indexed and assessment generated successfully');
                }
            } catch (error) {
                toast.error('Error indexing resume or generating assessment');
                console.error('Error indexing resume or generating assessment:', error);
            }
        }
    };

    // Added handleInputChange function
    const handleInputChange = (e, keyPath) => {
        const { value } = e.target;
        setResponse((prevResponse) => {
            const updatedResponse = { ...prevResponse };
            let nestedObject = updatedResponse;

            // Traverse the nested object using keyPath
            for (let i = 0; i < keyPath.length - 1; i++) {
                nestedObject = nestedObject[keyPath[i]];
            }

            // Set the new value at the correct path
            nestedObject[keyPath[keyPath.length - 1]] = value;

            return updatedResponse;
        });
    };

    const renderField = (key, value, keyPath = []) => {
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                return (
                    <div key={key} style={styles.fieldContainer}>
                        <label style={styles.fieldLabel}>{key}</label>
                        {value.map((item, index) => (
                            <div key={index} style={styles.nestedFieldContainer}>
                                {typeof item === 'object' ? (
                                    Object.entries(item).map(([subKey, subValue]) =>
                                        renderField(subKey, subValue, [...keyPath, key, index, subKey])
                                    )
                                ) : (
                                    <input
                                        type="text"
                                        value={item || ''}
                                        onChange={(e) => handleInputChange(e, [...keyPath, key, index])}
                                        style={styles.input}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div key={key} style={styles.fieldContainer}>
                        <label style={styles.fieldLabel}>{key}</label>
                        <div style={styles.nestedFieldContainer}>
                            {Object.entries(value).map(([subKey, subValue]) =>
                                renderField(subKey, subValue, [...keyPath, key, subKey])
                            )}
                        </div>
                    </div>
                );
            }
        } else {
            return (
                <div key={key} style={styles.fieldContainer}>
                    <label style={styles.fieldLabel}>{key}</label>
                    <input
                        type="text"
                        name={key}
                        value={value || ''}
                        onChange={(e) => handleInputChange(e, keyPath.concat(key))}
                        style={styles.input}
                    />
                </div>
            );
        }
    };

    return (
        <div className="App" style={{ margin: '20px' }}>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
            <div style={styles.containerStyle}>
                <div style={styles.pane}>
                    <div style={styles.scrollableContent}>
                        {pdfUrl ? (
                            <iframe title="PDF Viewer" src={pdfUrl} style={styles.pdfViewer}></iframe>
                        ) : (
                            <p style={styles.placeholderText}>Upload a PDF to view its content.</p>
                        )}
                    </div>
                    <div style={styles.stickyFileUploader}>
                        <FileUploader onFileChange={handleFileChange} buttonStyle={styles.uploadButton} />
                    </div>
                </div>
                <div style={styles.pane}>
                    {isLoading ? (
                        <div style={styles.loaderStyle}>
                            <div className="loader"></div>
                        </div>
                    ) : (
                        response && response.metadata && (
                            <>
                                <div style={styles.scrollableContent}>
                                    <div style={styles.headerStyle}>Personal Info</div>
                                    {response.metadata.personal_info && Object.entries(response.metadata.personal_info).map(([key, value]) =>
                                        renderField(key, value, ['metadata', 'personal_info', key])
                                    )}

                                    <div style={styles.headerStyle}>Experience Summary</div>
                                    {Array.isArray(response.metadata.experience_summary) && response.metadata.experience_summary.map((exp, index) =>
                                        renderField(`Experience ${index + 1}`, exp, ['metadata', 'experience_summary', index])
                                    )}

                                    <div style={styles.headerStyle}>Education Summary</div>
                                    {Array.isArray(response.metadata.education_summary) ? (
                                        response.metadata.education_summary.map((education, index) =>
                                            renderField(`Education ${index + 1}`, education, ['metadata', 'education_summary', index])
                                        )
                                    ) : (
                                        <p>No education data available.</p>
                                    )}

                                    <div style={styles.headerStyle}>Skills</div>
                                    {Array.isArray(response.metadata.skills) && renderField('skills', response.metadata.skills, ['metadata', 'skills'])}

                                    <div style={styles.headerStyle}>Risk Analysis</div>
                                    {response.metadata.risk_rating && (
                                        <>
                                            {renderField('Risk Rating', response.metadata.risk_rating, ['metadata', 'risk_rating'])}
                                        </>
                                    )}

                                    <div style={styles.headerStyle}>Skillwise Experience</div>
                                    {response.metadata.skillwise_experience && Object.entries(response.metadata.skillwise_experience).map(([skill, experience]) =>
                                        renderField(skill, experience, ['metadata', 'skillwise_experience', skill])
                                    )}
                                </div>
                                <div style={styles.stickyFileUploader}>
                                    <button style={styles.uploadButton} onClick={handleIndexResume}>
                                        Index Resume
                                    </button>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

// Embedded FileUploader Component
function FileUploader({ onFileChange, buttonStyle }) {
    return (
        <div>
            <input
                type="file"
                id="file"
                onChange={onFileChange}
                style={{ display: 'none' }} // Hide the default file input
            />
            <label htmlFor="file" style={buttonStyle}>
                Choose File
            </label>
        </div>
    );
}

// Styles used in ResumeParser component
const styles = {
    containerStyle: {
        display: 'flex',
        flexDirection: 'row',
        padding: '20px',
        gap: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        height: '800px',
    },
    pane: {
        flex: '1 1 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        backgroundColor: 'white',
        height: '100%',
        overflow: 'hidden',
    },
    scrollableContent: {
        overflowY: 'auto',
        padding: '10px',
        margin: '10px',
        flex: 1,
    },
    pdfViewer: {
        width: '100%',
        height: '100%',
        border: 'none',
    },
    placeholderText: {
        textAlign: 'center',
        color: '#888',
        fontStyle: 'italic',
        marginTop: '20px',
    },
    stickyFileUploader: {
        position: 'sticky',
        bottom: '0',
        backgroundColor: '#fff',
        padding: '15px',
        boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        textAlign: 'center',
    },
    headerStyle: {
        fontSize: '20px',
        color: '#584AB7',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px',
        marginBottom: '20px',
    },
    loaderStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    fieldContainer: {
        marginBottom: '20px',
    },
    fieldLabel: {
        fontWeight: 'bold',
        color: '#555',
    },
    input: {
        padding: '8px',
        width: 'calc(100% - 30px)',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginRight: '10px',
        fontSize: '12px',
    },
    nestedFieldContainer: {
        padding: '15px',
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        backgroundColor: '#f9f9f9',
    },
    uploadButton: {
        padding: '8px 16px',
        backgroundColor: '#584AB7',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'inline-block',
    },
};

export default CandidateProfile;
