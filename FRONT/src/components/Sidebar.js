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
          borderRight: 'none', // Remove border
          // Apply blur and transparency based on mode
          ...(theme.palette.mode === 'light' ? {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(245, 245, 247, 0.8)', // Semi-transparent light background
            color: theme.palette.text.primary, // Use primary text color for light mode
          } : {
            backgroundColor: '#1c1c1e', // Keep dark background opaque for readability
            color: theme.palette.text.secondary, // Use secondary text color for dark mode contrast
          }),
        },
      })}
    >
      <Toolbar /> {/* Offset for AppBar */}
      <Box sx={{ overflow: 'auto', padding: 2 }}>
        {/* Header de la Sidebar */}
        <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2, fontWeight: 600 }}>
          TP_CSID Dashboard
        </Typography>
        <Divider sx={{ borderColor: theme => theme.palette.divider }} />

        {/* Liste des menus */}
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
                    color: theme.palette.text.secondary, // Default text color for items
                    '& .MuiListItemIcon-root': { // Target icon color
                      color: theme.palette.text.secondary,
                    },
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                      color: theme.palette.primary.main, // Highlight color for text
                       '& .MuiListItemIcon-root': {
                          color: theme.palette.primary.main, // Highlight color for icon
                       },
                      '&:hover': {
                        backgroundColor: theme.palette.action.selected,
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  })}
                >
                  <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1.5 }}>
                    <img src={item.icon} alt={item.text} style={{ width: 20, height: 20 /* Add filter based on theme if needed */ }} />
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer de la Sidebar */}
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