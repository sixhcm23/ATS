import React, { useState } from 'react';
import axios from 'axios';
import { Button, Snackbar, Alert } from '@mui/material';

function BulkResumeParser() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFiles([...event.target.files]);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert("Please select files before uploading.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('resumes', file);
        });

        try {
            const res = await axios.post('http://localhost:5011/ats/upload-resumes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("response received:", res.data);
            setOpenSnackbar(true);
            setSelectedFiles([]); // Clear the selected files after successful upload
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const sectionStyle = {
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        marginBottom: '20px',
    };

    return (
        <div className="App" style={{ margin: '20px' }}>
            <div style={sectionStyle}>
                <h4>Select Resumes to Upload</h4>
                <input type="file" multiple onChange={handleFileChange} />
                <div style={{ marginTop: '20px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Uploading...' : 'Upload Resumes'}
                    </Button>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div style={sectionStyle}>
                    <h4>Files to be Uploaded:</h4>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity="success">
                    Files Uploaded for parsing
                </Alert>
            </Snackbar>
        </div>
    );
}

export default BulkResumeParser;
