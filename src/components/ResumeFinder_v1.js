import React, { useState } from 'react';

// Define the styles as JavaScript objects
const styles = {
// Styles for the top search section
searchSection: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
},
searchWrapper: {
  position: 'relative',
  width: '60%',
  marginBottom: '20px',
},
searchInput: {
  width: '100%',
  padding: '10px',
  paddingRight: '40px', // Make room for the icon inside the input
  borderRadius: '20px',
  fontSize: '16px',
},
searchIcon: {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  cursor: 'pointer',
},
toggleOptions: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px', // Space between toggle options
},
resultsSection: {
  display: 'flex',
  flexWrap: 'wrap', // Enable wrapping
  justifyContent: 'space-around', // Evenly space the cards with space around them
  margin: "20px"
},
card: {
  width: 'calc(25% - 60px)', // Adjust the card width to fit 4 in a row, accounting for gap
  // Keep the rest of your card styles unchanged
  background: '#fff',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  padding: '20px',
  margin: '10px', // You might adjust or remove this based on your gap
  height: '200px', // Fixed height for consistency
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // Added to ensure content does not overflow the card
},
  cardContent: {
    overflowY: 'auto', // Make content scrollable vertically
    paddingRight: '5px', // Adjust if necessary to avoid cutting off scrollbar
  },
  skillsContainer: {
    flex: 1, // Take up remaining space
    overflowY: 'auto', // Enable vertical scrolling for the skills list
    marginTop: '10px', // Add some space above the skills list
  },
  cardTitle: {
    margin: 0,
    color: '#333',
    fontSize: '20px',
  },
  cardText: {
    margin: '5px 0',
    color: '#666',
    fontSize: '14px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderRadius: '15px',
    padding: '5px 15px',
    fontSize: '12px',
    marginRight: '10px',
    marginBottom: '10px',
    whiteSpace: 'nowrap',
  },
};

const getBorderColorByRating = (rating) => {
  if (rating >= 8) return 'green';
  if (rating >= 5) return '#FFBF00'; // Assuming 'amber' is a defined color or you can use '#FFBF00' or similar
  return 'red';
};

const ResumeFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [method, setMethod] = useState('neural'); // Default method
  const [results, setResults] = useState(null);

  const searchResumes = async (e) => {
    e.preventDefault(); // Prevents the form from refreshing the page
    try {
      const response = await fetch(`http://localhost:5011/ats/resume/search/?method=${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setResults(data.result); // Update to use the data.result structure
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      setResults([]);
    }
  };

  return (
    <div className="resume-screener">
      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
      <input
        type="text"
        placeholder="Search resumes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
      />
      <span style={styles.searchIcon} onClick={searchResumes}>
        {/* Assuming you're using an SVG for the search icon */}
        <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
          <path d="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 8.5a6.5 6.5 0 1111.8 4.1l4.9 4.9a1 1 0 01-1.4 1.4l-4.9-4.9A6.5 6.5 0 012 8.5z" />
        </svg>
      </span>
    </div>
        <div style={styles.toggleOptions}>
          <label>
            <input
              type="radio"
              name="method"
              value="text"
              checked={method === 'text'}
              onChange={() => setMethod('text')}
            /> Text
          </label>
          <label>
            <input
              type="radio"
              name="method"
              value="neural"
              checked={method === 'neural'}
              onChange={() => setMethod('neural')}
            /> Recommendation
          </label>
          <label>
            <input
              type="radio"
              name="method"
              value="llm"
              checked={method === 'llm'}
              onChange={() => setMethod('llm')}
            /> AI Screener
          </label>
        </div>
      </div>

      <div style={styles.resultsSection}>
      {results && results.length > 0 ? (
        results.map((candidate, index) => {
          const borderColor = getBorderColorByRating(candidate.payload.risk_rating);

          // Create a dynamic style for the card that includes the border color
          const dynamicCardStyle = {
            ...styles.card,
            borderBottom: `4px solid ${borderColor}`,
          };

          return (

            
            
            <div key={index} style={dynamicCardStyle}>
              
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{candidate.payload.personal_info.name}</h3>
                <p style={styles.cardText}>Phone: {candidate.payload.personal_info.phone}</p>
                <p style={styles.cardText}>Email: {candidate.payload.personal_info.email}</p>
                <p style={styles.cardText}>Score: {candidate.score.toFixed(2)}</p>
               
              </div>

            </div>
          );
        })
      ) : (
        <p>No results to display. Please submit a search query.</p>
      )}
    </div>

    </div>
  );
};

export default ResumeFinder;
