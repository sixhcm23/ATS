import React, { useState, useEffect } from 'react';
import ResumeFinder from './components/ResumeFinder';
import ResumeScreener from './components/ResumeScreener';
import QBRSearch from './components/QBRSearch';
import SideDrawer from './components/SideDrawer';
import ResumeParser from './components/ResumeParser';
import BulkResumeParser from './components/BulkResumeParser';
import IndexResume from './components/IndexResume';
import SkillAssessment from './components/SkillAssessment';
import CandidateEvaluation from './components/CandidateEvaluation';
import CandidateProfile from './components/CandidateProfile';
import Login from './components/Login'; // Import Login component
import ProctoringComponent from './components/ProctoringComponent';

function App() {
  const [activeTab, setActiveTab] = useState('Smart ATS'); // Default to 'Smart ATS'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State for drawer
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [userEmail, setUserEmail] = useState(''); // Track user's email

  // Function to handle login
  const handleLogin = (email) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    localStorage.setItem('userEmail', email); // Store email in local storage
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const contentStyle = {
    marginTop: '20px',
    marginLeft: isDrawerOpen ? '250px' : '60px',  // Adjust content based on drawer state
    transition: 'margin-left 0.3s ease',
    padding: '20px',
  };

  // If the user is not logged in, show the login page
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // If the user is logged in, show the main app
  return (
    <div className="App" style={{ margin: '20px', fontFamily: 'Arial' }}>
      <SideDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div style={contentStyle}>
        {activeTab === 'Resume Parser' && <ResumeParser />}
        {activeTab === 'Bulk Resume Parser' && <BulkResumeParser />}
        {activeTab === 'Smart ATS' && <ResumeFinder />}
        {activeTab === 'Resume Uploader' && <ResumeScreener />}
        {activeTab === 'Index Bulk Resume' && <IndexResume />}
        {activeTab === 'Processed Upload' && <div>Processed Upload Content</div>}
        {activeTab === 'AI ReRanker' && <QBRSearch />}
        {activeTab === 'Job to Profile' && <div>Job to Profile Content</div>}
        {activeTab === 'Profile to Job' && <div>Profile to Job Content</div>}
        {activeTab === 'Search Profile' && <ResumeFinder />}
        {activeTab === 'Skill Assessment' && <SkillAssessment />}
        {activeTab === 'Evaluation Report' && <CandidateEvaluation />}
        {activeTab === 'Profile' && <CandidateProfile />}
      </div>

    </div>
  );
}

export default App;
