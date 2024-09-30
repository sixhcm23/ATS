import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const IndexResume = () => {
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [metadata, setMetadata] = useState({});
    const [pageContent, setPageContent] = useState('');

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await axios.get('http://localhost:5011/ats/fetch-all-resumes');
            setResumes(response.data);
            setSelectedResume(null);
            setMetadata({});
            setPageContent(''); // Clear page content when fetching new resumes
        } catch (error) {
            console.error('Error fetching resumes:', error);
        }
    };

    const handleRowClick = (resume) => {
        setSelectedResume(resume);
        setMetadata(resume.parsed_data.metadata);
        setPageContent(resume.parsed_data.page_content || '');
    };

    const handleInputChange = (e, keyPath) => {
        const { value } = e.target;
        setMetadata((prevMetadata) => {
            const updatedMetadata = { ...prevMetadata };
            let nestedObject = updatedMetadata;

            for (let i = 0; i < keyPath.length - 1; i++) {
                nestedObject = nestedObject[keyPath[i]];
            }

            nestedObject[keyPath[keyPath.length - 1]] = value;

            return updatedMetadata;
        });
    };

    const handleAddItem = (keyPath) => {
        setMetadata((prevMetadata) => {
            const updatedMetadata = { ...prevMetadata };
            let nestedObject = updatedMetadata;

            for (let i = 0; i < keyPath.length; i++) {
                if (i === keyPath.length - 1) {
                    nestedObject[keyPath[i]].push(''); // Add a new empty item to the array
                } else {
                    nestedObject = nestedObject[keyPath[i]];
                }
            }

            return updatedMetadata;
        });
    };

    const handleDeleteItem = (keyPath, index) => {
        setMetadata((prevMetadata) => {
            const updatedMetadata = { ...prevMetadata };
            let nestedObject = updatedMetadata;

            for (let i = 0; i < keyPath.length; i++) {
                if (i === keyPath.length - 1) {
                    nestedObject[keyPath[i]].splice(index, 1); // Remove the item from the array
                } else {
                    nestedObject = nestedObject[keyPath[i]];
                }
            }

            return updatedMetadata;
        });
    };

    const handleDeleteResume = async () => {
        if (selectedResume) {
            const resumeId = selectedResume.resume_id;
            try {
                await axios.delete(`http://localhost:5011/ats/delete-resume/${resumeId}`);
                toast.success('Resume deleted successfully');
                fetchResumes(); // Refresh the content after deletion
            } catch (error) {
                toast.error('Error deleting resume');
                console.error('Error deleting resume:', error);
            }
        }
    };

    const handleIndexResume = async () => {
        try {
            const response = await axios.post('http://localhost:5011/ats/resume/index/', { metadata, page_content: pageContent });
            if (response.status >= 200 && response.status < 300) {
                toast.success('Resume indexed successfully');
                await handleDeleteResume(); // Delete resume and refresh
            }
        } catch (error) {
            toast.error('Error indexing resume');
            console.error('Error indexing resume:', error);
        }
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
        <div style={styles.container}>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            {/* Left side: Resume table */}
            <div style={styles.leftPane}>
                <h3 style={styles.heading}>Resume Index</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Resume ID</th>
                            <th style={styles.tableHeader}>First Name</th>
                            <th style={styles.tableHeader}>Last Name</th>
                            <th style={styles.tableHeader}>Email ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumes.map((resume) => (
                            <tr
                                key={resume.resume_id}
                                onClick={() => handleRowClick(resume)}
                                style={styles.tableRow}
                            >
                                <td style={styles.tableCell}>{resume.resume_id}</td>
                                <td style={styles.tableCell}>{resume.parsed_data?.metadata?.personal_info?.first_name}</td>
                                <td style={styles.tableCell}>{resume.parsed_data?.metadata?.personal_info?.last_name}</td>
                                <td style={styles.tableCell}>{resume.parsed_data?.metadata?.personal_info?.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Right side: Editable metadata form */}
            <div style={styles.rightPane}>
                {selectedResume ? (
                    <>
                        <div style={styles.headerActions}>
                            <h3 style={styles.rightPaneHeader}>Parsed content {selectedResume.resume_id}</h3>
                            <div style={styles.buttonGroup}>
                                <button style={styles.actionButton} onClick={handleIndexResume}>Index Resume</button>
                                <button style={styles.deleteButton} onClick={handleDeleteResume}>Delete Resume</button>
                            </div>
                        </div>
                        <div style={styles.scrollableContent}>
                            <form style={styles.form}>
                                {Object.entries(metadata).map(([key, value]) => renderField(key, value))}
                            </form>
                        </div>
                    </>
                ) : (
                    <p style={styles.placeholderText}>Select a resume to view and edit metadata.</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
    },
    leftPane: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    rightPane: {
        flex: 2,
        padding: '25px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
    },
    headerActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
    },
    rightPaneHeader: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#333',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
    },
    actionButton: {
        padding: '10px 18px',
        backgroundColor: '#584AB7',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    deleteButton: {
        padding: '10px 18px',
        backgroundColor: '#e74c3c',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    scrollableContent: {
        maxHeight: '550px',
        overflowY: 'auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#fafafa',
    },
    heading: {
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#333',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        textAlign: 'left',
        padding: '12px',
        backgroundColor: '#584AB7',
        color: '#fff',
    },
    tableRow: {
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    tableCell: {
        padding: '14px',
        borderBottom: '1px solid #ddd',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
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
        padding: '12px',
        width: 'calc(100% - 40px)',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginRight: '10px',
        fontSize: '14px',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    nestedFieldContainer: {
        padding: '20px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        backgroundColor: '#f9f9f9',
    },
    placeholderText: {
        color: '#999',
        fontStyle: 'italic',
    },
    iconButton: {
        cursor: 'pointer',
        color: '#584AB7',
        fontSize: '20px',
    },
};

export default IndexResume;
