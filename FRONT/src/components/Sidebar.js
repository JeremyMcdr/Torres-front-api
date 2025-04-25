import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Icônes (gardées comme imports directs pour l'instant)
import DashboardIcon from '../assets/dashboard-icon.svg';
import ChartIcon from '../assets/chart-icon.svg';
import UserIcon from '../assets/user-icon.svg';
import TargetIcon from '../assets/target-icon.svg';
import ReasonIcon from '../assets/reason-icon.svg';

const drawerWidth = 240; // Assurez-vous que cette largeur correspond à celle dans Layout.js et Header.js

const menuItems = [
  { text: 'Tableau de bord', path: '/', icon: DashboardIcon },
  { text: 'Chiffre d\'affaires', path: '/chiffre-affaires', icon: ChartIcon },
  { text: 'Commerciaux', path: '/commerciaux', icon: UserIcon },
  { text: 'Objectifs', path: '/objectifs', icon: TargetIcon },
  { text: 'Motifs de commande', path: '/motifs', icon: ReasonIcon },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={theme => ({
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          ...(theme.palette.mode === 'light' ? {
            // Light mode: subtle gradient + blur
            backdropFilter: 'blur(12px)',
            background: 'linear-gradient(to bottom, rgba(245, 245, 247, 0.9), rgba(245, 245, 247, 0.75))',
            color: theme.palette.text.secondary, // Use secondary text for better contrast on light bg
             borderRight: `1px solid ${theme.palette.divider}`, // Add subtle border in light mode
          } : {
            // Dark mode: Slightly adjusted opaque dark background
            backgroundColor: '#161618', // Slightly different dark shade
            color: theme.palette.text.secondary,
          }),
        },
      })}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', padding: 2 }}>
        <Typography variant="h6" sx={theme => ({ 
            textAlign: 'center', 
            marginBottom: 2, 
            fontWeight: 600, 
            color: theme.palette.text.primary // Ensure title uses primary text color
          })}>
          TP_CSID Dashboard
        </Typography>
        <Divider sx={{ borderColor: theme => theme.palette.divider }} />

        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive}
                  sx={theme => ({
                    marginY: '5px',
                    borderRadius: theme.shape.borderRadius,
                    color: theme.palette.text.secondary, // Default item text color
                    '& .MuiListItemIcon-root': {
                      // Apply filter for SVG icons based on theme for basic visibility
                       filter: theme.palette.mode === 'dark' ? 'invert(70%) sepia(10%) saturate(0%) hue-rotate(180deg) brightness(100%) contrast(90%)' : 'none',
                       opacity: 0.8,
                       color: theme.palette.text.secondary, // Ensure consistency if replaced by Font Icons
                    },
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                      color: theme.palette.primary.main,
                       '& .MuiListItemText-root': {
                         fontWeight: 500, // Make selected text slightly bolder
                       },
                       '& .MuiListItemIcon-root': {
                          color: theme.palette.primary.main,
                          filter: 'none', // Remove filter for selected icon
                          opacity: 1,
                       },
                      '&:hover': {
                        backgroundColor: theme.palette.action.selected, // Keep selection color on hover
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.text.primary, // Darken text slightly on hover
                       '& .MuiListItemIcon-root': {
                          // filter: 'none', // Optionally adjust hover filter
                          opacity: 1,
                          color: theme.palette.text.primary,
                       },
                    },
                  })}
                >
                  <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1.5 }}>
                    <img src={item.icon} alt={item.text} style={{ width: 20, height: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ padding: 2, marginTop: 'auto', textAlign: 'center' }}>
        <Divider sx={{ borderColor: theme => theme.palette.divider, marginBottom: 1 }} />
        <Typography variant="caption" sx={{ color: theme => theme.palette.text.secondary }}>
          © 2024 TP_CSID
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 