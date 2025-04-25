import React from 'react';
import Box from '@mui/material/Box';

import Sidebar from './Sidebar';
import Header from './Header';
// import './Layout.css'; // Removed, styling handled by MUI Box

const drawerWidth = 240;

const Layout = ({ children, title }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header title={title} />

      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          mt: { xs: '56px', sm: '64px' },
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 