import React, { useState } from 'react';
import axios from 'axios';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ResumeParser() {
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
            toast.error("Unable to parse Resume. Please try again. If problem persist please inform the administrator");
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
                const pageContent = response["page_content"];
                delete response["page_content"];
                const res = await axios.post('http://localhost:5011/ats/resume/index/', {
                    metadata: response,
                    page_content: pageContent, // Assuming page_content is the PDF URL
                });
                if (res.status >= 200 && res.status < 300) {
                    toast.success('Resume indexed successfully');
                }
            } catch (error) {
                toast.error('Error indexing resume');
                console.error('Error indexing resume:', error);
            }
        }
    };

    const handleInputChange = (e, keyPath) => {
        const { value } = e.target;
        setResponse((prevResponse) => {
            const updatedResponse = { ...prevResponse };
            let nestedObject = updatedResponse;

            for (let i = 0; i < keyPath.length - 1; i++) {
                nestedObject = nestedObject[keyPath[i]];
            }

            nestedObject[keyPath[keyPath.length - 1]] = value;

            return updatedResponse;
        });
    };

    const handleAddItem = (keyPath) => {
        setResponse((prevResponse) => {
            const updatedResponse = { ...prevResponse };
            let nestedObject = updatedResponse;

            for (let i = 0; i < keyPath.length; i++) {
                if (i === keyPath.length - 1) {
                    nestedObject[keyPath[i]].push(''); // Add a new empty item to the array
                } else {
                    nestedObject = nestedObject[keyPath[i]];
                }
            }

            return updatedResponse;
        });
    };

    const handleDeleteItem = (keyPath, index) => {
        setResponse((prevResponse) => {
            const updatedResponse = { ...prevResponse };
            let nestedObject = updatedResponse;

            for (let i = 0; i < keyPath.length; i++) {
                if (i === keyPath.length - 1) {
                    nestedObject[keyPath[i]].splice(index, 1); // Remove the item from the array
                } else {
                    nestedObject = nestedObject[keyPath[i]];
                }
            }

            return updatedResponse;
        });
    };

    const renderField = (key, value, keyPath = []) => {
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                return (
                    <div key={key} style={styles.fieldContainer}>
                        <div style={styles.fieldHeader}>
                            <label style={styles.fieldLabel}>{key}</label>
                            <AddCircleOutline
                                style={styles.iconButton}
                                onClick={() => handleAddItem([...keyPath, key])}
                            />
                        </div>
                        {value.map((item, index) => (
                            <div key={index} style={styles.nestedFieldContainer}>
                                {typeof item === 'object' ? (
                                    <>
                                        {Object.entries(item).map(([subKey, subValue]) =>
                                            renderField(subKey, subValue, [...keyPath, key, index, subKey])
                                        )}
                                        <RemoveCircleOutline
                                            style={styles.iconButton}
                                            onClick={() => handleDeleteItem([...keyPath, key], index)}
                                        />
                                    </>
                                ) : (
                                    <div style={styles.inputContainer}>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleInputChange(e, [...keyPath, key, index])}
                                            style={styles.input}
                                        />
                                        <RemoveCircleOutline
                                            style={styles.iconButton}
                                            onClick={() => handleDeleteItem([...keyPath, key], index)}
                                        />
                                    </div>
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
                        response && (
                            <>
                                <div style={styles.scrollableContent}>
                                    <div style={styles.headerStyle}>Personal Info</div>
                                    {response.personal_info && Object.entries(response.personal_info).map(([key, value]) =>
                                        renderField(key, value, ['personal_info', key])
                                    )}

                                    <div style={styles.headerStyle}>Experience Summary</div>
                                    {Array.isArray(response.experience_summary?.professional_experience) && response.experience_summary.professional_experience.map((exp, index) =>
                                        renderField(`Experience ${index + 1}`, exp, ['experience_summary', 'professional_experience', index])
                                    )}

                                    <div style={styles.headerStyle}>Education Summary</div>
                                    {Array.isArray(response.education_summary?.Education) ? (
                                        response.education_summary.Education.map((education, index) =>
                                            renderField(`Education ${index + 1}`, education, ['education_summary', 'Education', index])
                                        )
                                    ) : (
                                        <p>No education data available.</p>
                                    )}

                                    <div style={styles.headerStyle}>Project Details</div>
                                    {Array.isArray(response.project_details?.projects) && response.project_details.projects.map((project, index) =>
                                        renderField(`Project ${index + 1}`, project, ['project_details', 'projects', index])
                                    )}

                                    <div style={styles.headerStyle}>Certifications</div>
                                    {Array.isArray(response.certifications?.certifications) && response.certifications.certifications.map((certification, index) =>
                                        renderField(`Certification ${index + 1}`, certification, ['certifications', 'certifications', index])
                                    )}

                                    <div style={styles.headerStyle}>Skills</div>
                                    {Array.isArray(response.current_skills?.skills) && renderField('current_skills', response.current_skills.skills, ['current_skills', 'skills'])}

                                    <div style={styles.headerStyle}>Risk Analysis</div>
                                    {response.risk_analysis && (
                                        <>
                                            {renderField('Risk Rating', response.risk_analysis.risk_rating, ['risk_analysis', 'risk_rating'])}
                                            {renderField('Strengths', response.risk_analysis.strengths, ['risk_analysis', 'strengths'])}
                                            {renderField('Weakness', response.risk_analysis.weakness, ['risk_analysis', 'weakness'])}
                                        </>
                                    )}

                                    <div style={styles.headerStyle}>Skillwise Experience</div>
                                    {response.skill_wise_experience && Object.entries(response.skill_wise_experience).map(([skill, experience]) =>
                                        renderField(skill, experience, ['skill_wise_experience', skill])
                                    )}

                                    <div style={styles.headerStyle}>Strengths & Weaknesses</div>
                                    {response.strengths_weaknesses && Object.entries(response.strengths_weaknesses).map(([key, value]) =>
                                        renderField(key, value, ['strengths_weaknesses', key])
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
        margin : '10px',
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
    fieldHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
    },
    fieldLabel: {
        fontWeight: 'bold',
        color: '#555',
    },
    input: {
        padding: '8px', // Reduced padding for smaller input size
        width: 'calc(100% - 30px)', // Adjusted width to fit smaller input size
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginRight: '10px',
        fontSize: '12px', // Smaller font size
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    nestedFieldContainer: {
        padding: '15px', // Reduced padding
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        backgroundColor: '#f9f9f9',
    },
    iconButton: {
        cursor: 'pointer',
        color: '#584AB7',
        fontSize: '18px', // Reduced icon size
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between', // Align buttons horizontally
        padding: '15px 0 0 0', // Reduced padding
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #ddd',
        position: 'sticky',
        bottom: '0',
    },
    indexButton: {
        padding: '8px 16px', // Reduced button size
        backgroundColor: '#584AB7',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px', // Smaller font size
        marginRight: '10px',
    },
    uploadButton: {
        padding: '8px 16px', // Reduced button size
        backgroundColor: '#584AB7',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px', // Smaller font size
        display: 'inline-block'
    },
};

export default ResumeParser;
