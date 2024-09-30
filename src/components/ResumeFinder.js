import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Define the styles as JavaScript objects
const styles = {
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f0f4f8', // Light background for contrast
    borderRadius: '8px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
  searchWrapper: {
    position: 'relative',
    width: '60%',
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    height: '80px', // Set height for the textarea
    padding: '12px',
    borderRadius: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle inner shadow for depth
    resize: 'vertical', // Allow vertical resizing
  },
  searchIcon: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    cursor: 'pointer',
    color: '#584AB7',
  },
  resultsSection: {
    display: 'flex',
    flexWrap: 'wrap', // Enable wrapping
    justifyContent: 'center', // Center the cards
    gap: '20px',
    margin: '20px',
  },
  card: {
    width: 'calc(20% - 40px)', // Adjust the card width to fit 5 in a row, accounting for gap
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    padding: '10px', // Adjust padding to fit more content
    margin: '10px', // Reduced margin
    height: '120px', // Reduced height for a compact design
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Center content vertically
    overflow: 'hidden', // Ensure content does not overflow the card
    cursor: 'pointer', // Add pointer cursor to indicate the card is clickable
    transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth hover effect
  },
  cardHover: {
    transform: 'scale(1.05)', // Slightly enlarge the card on hover
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Increase shadow on hover
  },
  cardContent: {
    textAlign: 'center', // Center-align the content for a clean look
    padding: '5px', // Adjust padding for balance
    overflowY: 'auto', // Make content scrollable vertically if needed
  },
  drawerContent: {
    width: '450px', // Slightly wider drawer for better readability
    padding: '20px',
    backgroundColor: '#f9f9f9', // Light background for the drawer
    borderRadius: '8px 0 0 8px', // Rounded corners on the left side
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  drawerTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#584AB7', // Updated to the requested color
  },
  sectionTitle: {
    color: '#584AB7', // Updated to the requested color
    margin: '10px 0 5px', // Adjust spacing around the section titles
    fontSize: '18px', // Adjust the font size
    fontWeight: 'bold', // Make the section titles bold
  },
  cardTitle: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '16px', // Adjust font size for clarity
    fontWeight: 'bold',
    whiteSpace: 'nowrap', // Prevents text from wrapping
    overflow: 'hidden',
    textOverflow: 'ellipsis', // Truncate text with ellipsis if too long
  },
  cardText: {
    margin: '3px 0',
    color: '#666',
    fontSize: '12px', // Adjust font size for smaller cards
    whiteSpace: 'nowrap', // Prevents text from wrapping
    overflow: 'hidden',
    textOverflow: 'ellipsis', // Truncate text with ellipsis if too long
  },
  listItem: {
    marginBottom: '8px',
    color: '#555',
    fontSize: '14px',
    padding: '5px',
    backgroundColor: '#eef', // Light blue background for list items
    borderRadius: '5px',
  },
  subItem: {
    paddingLeft: '15px',
    fontSize: '13px',
    color: '#444',
  },
};

const getBorderColorByRating = (rating) => {
  if (rating >= 8) return 'green';
  if (rating >= 5) return '#FFBF00'; // Amber color
  return 'red';
};

const ResumeFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  const method = 'neural';

  const searchResumes = async (e) => {
    e.preventDefault();
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
      setResults(data.result);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      setResults([]);
    }
  };

  const openDrawer = (resume) => {
    setSelectedResume(resume);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedResume(null);
  };

  const renderFullName = (personalInfo) => {
    const { first_name, mid_name, last_name } = personalInfo;
    return [first_name, mid_name, last_name].filter(Boolean).join(' ').trim();
  };

  const renderContent = (key, value, level = 0) => {
    if (Array.isArray(value)) {
      return (
        <div key={key} style={{ marginLeft: level * 15 }}>
          <p style={styles.sectionTitle}>{key.replace(/_/g, ' ')}:</p>
          {value.map((item, index) => (
            <div key={index} style={styles.subItem}>
              {typeof item === 'object' ? renderNestedObject(item, level + 1) : <p>{item}</p>}
            </div>
          ))}
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} style={{ marginLeft: level * 15 }}>
          <p style={styles.sectionTitle}>{key.replace(/_/g, ' ')}:</p>
          {renderNestedObject(value, level + 1)}
        </div>
      );
    } else {
      return (
        <p key={key} style={{ ...styles.cardText, marginLeft: level * 15 }}>
          <strong>{key.replace(/_/g, ' ')}:</strong> {value}
        </p>
      );
    }
  };

  const renderNestedObject = (obj, level) => (
    <div key={level} style={{ marginBottom: '10px' }}>
      {Object.entries(obj).map(([key, value]) =>
        renderContent(key, value, level)
      )}
    </div>
  );

  const renderPersonalInfo = (personalInfo) => (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={styles.sectionTitle}>Personal Information</h3>
      {Object.entries(personalInfo).map(([key, value]) =>
        renderContent(key, value)
      )}
    </div>
  );

  return (
    <div className="resume-screener">
      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <textarea
            placeholder="Search resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <span style={styles.searchIcon} onClick={searchResumes}>
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
              <path d="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 8.5a6.5 6.5 0 1111.8 4.1l4.9 4.9a1 1 0 01-1.4 1.4l-4.9-4.9A6.5 6.5 0 012 8.5z" />
            </svg>
          </span>
        </div>
      </div>

      <div style={styles.resultsSection}>
        {results && results.length > 0 ? (
          results.map((candidate, index) => {
            const borderColor = getBorderColorByRating(candidate.payload.risk_rating);

            const dynamicCardStyle = {
              ...styles.card,
              borderBottom: `4px solid ${borderColor}`,
            };

            return (
              <div
                key={index}
                style={dynamicCardStyle}
                onClick={() => openDrawer(candidate)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{renderFullName(candidate.payload.personal_info)}</h3>
                  <p style={styles.cardText}>Phone: {candidate.payload.personal_info.phone_number}</p>
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

      <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
        <div style={styles.drawerContent}>
          <div style={styles.drawerHeader}>
            <h2 style={styles.drawerTitle}>Resume Details</h2>
            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </div>
          {selectedResume && (
            <div>
              {renderPersonalInfo(selectedResume.payload.personal_info)}
              {Object.entries(selectedResume.payload).filter(([key]) => key !== 'personal_info').map(([key, value]) =>
                renderContent(key, value)
              )}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default ResumeFinder;