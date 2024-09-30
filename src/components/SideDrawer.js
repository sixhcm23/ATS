import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Collapse } from '@mui/material';
import { UploadFile, Storage, People, Search, Assessment, MiscellaneousServices, ExpandLess, ExpandMore, Description, Folder, School, BarChart, AccountCircle, Work } from '@mui/icons-material';
import PeopleXMLogo from '../assets/peoplexm-2.png'; // Adjust the path based on your project structure

const SideDrawer = ({ isOpen, setIsOpen, activeTab, setActiveTab }) => {
  const [atsOpen, setAtsOpen] = React.useState(false);  // New ATS section
  const [resumeProcessingOpen, setResumeProcessingOpen] = React.useState(false);
  const [profileMatchingOpen, setProfileMatchingOpen] = React.useState(false);
  const [miscellaneousOpen, setMiscellaneousOpen] = React.useState(false);
  const [candidateCenterOpen, setCandidateCenterOpen] = React.useState(false);

  const handleAtsClick = () => {
    setAtsOpen(!atsOpen);
  };

  const handleResumeProcessingClick = () => {
    setResumeProcessingOpen(!resumeProcessingOpen);
  };

  const handleProfileMatchingClick = () => {
    setProfileMatchingOpen(!profileMatchingOpen);
  };

  const handleMiscellaneousClick = () => {
    setMiscellaneousOpen(!miscellaneousOpen);
  };

  const handleCandidateCenterClick = () => {
    setCandidateCenterOpen(!candidateCenterOpen);
  };

  // Collapse all submenus when the drawer collapses
  useEffect(() => {
    if (!isOpen) {
      setAtsOpen(false);
      setResumeProcessingOpen(false);
      setProfileMatchingOpen(false);
      setMiscellaneousOpen(false);
      setCandidateCenterOpen(false);
    }
  }, [isOpen]);

  const drawerStyle = {
    width: isOpen ? 250 : 60,
    transition: 'width 0.4s ease',
    overflowX: 'hidden',
    backgroundColor: '#584BB7',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const iconStyle = {
    minWidth: isOpen ? '40px' : 'unset',
    display: 'flex',
    justifyContent: 'center',
    color: 'white',
  };

  const listItemStyle = {
    color: 'white',
  };

  const logoContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 0',
  };

  const logoStyle = {
    width: isOpen ? '150px' : '40px',
    transition: 'width 0.3s ease',
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      open={isOpen}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      PaperProps={{
        style: drawerStyle,
      }}
    >
      <List sx={{ width: isOpen ? 250 : 60 }}>
        {/* ATS Section */}
        <ListItem button onClick={handleAtsClick} sx={listItemStyle}>
          <ListItemIcon style={iconStyle}>
            <Work />
          </ListItemIcon>
          {isOpen && <ListItemText primary="ATS" sx={listItemStyle} />}
          {isOpen && (atsOpen ? <ExpandLess sx={listItemStyle} /> : <ExpandMore sx={listItemStyle} />)}
        </ListItem>

        <Collapse in={atsOpen} timeout="auto" unmountOnExit>
          {/* Resume Processing Section */}
          <ListItem button onClick={handleResumeProcessingClick} sx={listItemStyle}>
            <ListItemIcon style={iconStyle}>
              <Description />
            </ListItemIcon>
            {isOpen && <ListItemText primary="Resume Processing" sx={listItemStyle} />}
            {isOpen && (resumeProcessingOpen ? <ExpandLess sx={listItemStyle} /> : <ExpandMore sx={listItemStyle} />)}
          </ListItem>

          <Collapse in={resumeProcessingOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('Resume Parser')}>
                <ListItemIcon style={iconStyle}>
                  <UploadFile />
                </ListItemIcon>
                {isOpen && <ListItemText primary="Resume Parser" sx={listItemStyle} />}
              </ListItem>
              <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('Bulk Resume Parser')}>
                <ListItemIcon style={iconStyle}>
                  <Folder />
                </ListItemIcon>
                {isOpen && <ListItemText primary="Bulk Resume Parser" sx={listItemStyle} />}
              </ListItem>
              <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('Index Bulk Resume')}>
                <ListItemIcon style={iconStyle}>
                  <Storage />
                </ListItemIcon>
                {isOpen && <ListItemText primary="Index Bulk Resume" sx={listItemStyle} />}
              </ListItem>
            </List>
          </Collapse>

          {/* Profile Matching Section */}
          <ListItem button onClick={handleProfileMatchingClick} sx={listItemStyle}>
            <ListItemIcon style={iconStyle}>
              <People />
            </ListItemIcon>
            {isOpen && <ListItemText primary="Profile Matching" sx={listItemStyle} />}
            {isOpen && (profileMatchingOpen ? <ExpandLess sx={listItemStyle} /> : <ExpandMore sx={listItemStyle} />)}
          </ListItem>

          <Collapse in={profileMatchingOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('Search Profile')}>
                <ListItemIcon style={iconStyle}>
                  <Search />
                </ListItemIcon>
                {isOpen && <ListItemText primary="Search Profile" sx={listItemStyle} />}
              </ListItem>
            </List>
          </Collapse>
        </Collapse>

        {/* Candidate Center Section */}
        <ListItem button onClick={handleCandidateCenterClick} sx={listItemStyle}>
          <ListItemIcon style={iconStyle}>
            <School />
          </ListItemIcon>
          {isOpen && <ListItemText primary="Candidate Center" sx={listItemStyle} />}
          {isOpen && (candidateCenterOpen ? <ExpandLess sx={listItemStyle} /> : <ExpandMore sx={listItemStyle} />)}
        </ListItem>

        <Collapse in={candidateCenterOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('Profile')}>
              <ListItemIcon style={iconStyle}>
                <AccountCircle />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Profile" sx={listItemStyle} />}
            </ListItem>
            <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('Skill Assessment')}>
              <ListItemIcon style={iconStyle}>
                <BarChart />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Skill Assessment" sx={listItemStyle} />}
            </ListItem>
            <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('Evaluation Report')}>
              <ListItemIcon style={iconStyle}>
                <Assessment />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Evaluation Report" sx={listItemStyle} />}
            </ListItem>
            <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('Student Dashboard')}>
              <ListItemIcon style={iconStyle}>
                <Work />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Student Dashboard" sx={listItemStyle} />}
            </ListItem>
          </List>
        </Collapse>

        {/* Miscellaneous Section */}
        <ListItem button onClick={handleMiscellaneousClick} sx={listItemStyle}>
          <ListItemIcon style={iconStyle}>
            <MiscellaneousServices />
          </ListItemIcon>
          {isOpen && <ListItemText primary="Miscellaneous" sx={listItemStyle} />}
          {isOpen && (miscellaneousOpen ? <ExpandLess sx={listItemStyle} /> : <ExpandMore sx={listItemStyle} />)}
        </ListItem>

        <Collapse in={miscellaneousOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button sx={{ ...listItemStyle, pl: 4 }} onClick={() => setActiveTab('AI ReRanker')}>
              <ListItemIcon style={iconStyle}>
                <Search />
              </ListItemIcon>
              {isOpen && <ListItemText primary="AI ReRanker" sx={listItemStyle} />}
            </ListItem>
          </List>
        </Collapse>
      </List>

      {/* Logo at the Bottom */}
      <div style={logoContainerStyle}>
        <img src={PeopleXMLogo} alt="PeopleXM Logo" style={logoStyle} />
      </div>
    </Drawer>
  );
};

export default SideDrawer;
