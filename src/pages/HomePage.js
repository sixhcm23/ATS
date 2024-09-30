import React, { useState } from 'react';
import { Button } from '@mui/material';
import RightDrawer from './RightDrawer';

const HomePage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <div>
      <h1>Welcome to the Resume Management System</h1>
      <Button variant="contained" onClick={toggleDrawer(true)}>Open Menu</Button>
      <RightDrawer isOpen={drawerOpen} toggleDrawer={toggleDrawer} />
    </div>
  );
};

export default HomePage;
