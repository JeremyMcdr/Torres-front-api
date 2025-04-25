import React from 'react';
import Box from '@mui/material/Box';
import { useTheme, alpha } from '@mui/material/styles';

import Sidebar from './Sidebar';
import Header from './Header';
// import './Layout.css'; // Removed, styling handled by MUI Box

const drawerWidth = 240;

const Layout = ({ children, title }) => {
  const theme = useTheme();

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
          minHeight: 'calc(100vh - 64px)',
          background: theme.palette.mode === 'light'
            ? `linear-gradient(to bottom, ${theme.palette.background.default}, ${alpha(theme.palette.grey[300], 0.1)})`
            : `linear-gradient(to bottom, ${theme.palette.background.default}, ${alpha(theme.palette.grey[900], 0.3)})`,
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 