import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const drawerWidth = 240; // Standard drawer width, adjust if needed

const Header = ({ title }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <AppBar
      position="fixed" // Fix the header at the top
      sx={theme => ({ // Use theme callback to access theme values
        width: `calc(100% - ${drawerWidth}px)`, // Account for drawer width
        ml: `${drawerWidth}px`, // Margin to offset for the drawer
        // Apply backdrop blur and semi-transparent background
        backdropFilter: 'blur(12px)', // Slightly increased blur
        // Subtle gradient background overlaying the blur
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.7))'
          : 'linear-gradient(to bottom, rgba(30, 30, 30, 0.85), rgba(30, 30, 30, 0.7))', // Dark mode gradient
        // Add a subtle bottom border instead of shadow
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none', // Ensure no shadow
        color: 'text.primary', // Use theme's text color
      })}
    >
      <Toolbar>
        {/* Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title || 'Dashboard'} {/* Use passed title or default */}
        </Typography>

        {/* Date */}
        <Box>
          <Typography variant="body2" color="text.secondary">
            {currentDate}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 