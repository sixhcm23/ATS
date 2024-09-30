import React, { useState } from 'react';

function QBRSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
        },
        form: {
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
        },
        input: {
            padding: '10px',
            width: '300px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '8px',
        },
        button: {
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#584AB7',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
        resultContainer: {
            width: '80%',
            marginTop: '20px',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
        },
        header: {
            marginBottom: '5px',
            color: '#333',
        },
        list: {
            listStyleType: 'circle',
            marginLeft: '20px',
        },
        relevanceScore: {
            fontWeight: 'bold',
            marginTop: '10px',
        },
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch('http://localhost:5011/ats/resume/search?method=hybrid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            console.error("Failed to fetch data");
            return;
        }

        const data = await response.json();
        // Check if data.result.candidates is an array before setting it
        if (Array.isArray(data.result?.candidates)) {
            setResults(data.result.candidates);
        } else {
            setResults([]); // Set results to an empty array if it's not defined
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for resumes..."
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Search</button>
            </form>

            {results.length > 0 ? (
                results.map((candidate, index) => (
                    <div key={index} style={styles.resultContainer}>
                        <h3 style={styles.header}>{candidate.name}</h3>
                        <h4 style={styles.header}>Relevance Summary</h4>
                        <p>{candidate.relevance_summary}</p>
                        <h4 style={styles.header}>Missing Skills</h4>
                        <ul style={styles.list}>
                            {candidate.missing_skills && candidate.missing_skills.map((skill, skillIndex) => (
                                <li key={skillIndex}>{skill}</li>
                            ))}
                        </ul>
                        <p style={styles.relevanceScore}>Relevance Score: {candidate.relevance_score}</p>
                        <p>Similarity Score: {candidate.similarity_score?.toFixed(2)}</p>
                    </div>
                ))
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}

export default QBRSearch;
