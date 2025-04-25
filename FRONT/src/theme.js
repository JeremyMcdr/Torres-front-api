import { createTheme } from '@mui/material/styles';

// --- Light Mode Palette ---
const lightPalette = {
  primary: {
    main: '#007AFF', // Apple blue
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#5856D6', // Apple purple
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f7', // Light grey background
    paper: '#ffffff',   // White for card/paper backgrounds
  },
  text: {
    primary: '#1d1d1f', // Near-black
    secondary: '#6e6e73', // Slightly darker grey than before
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

// --- Dark Mode Palette ---
const darkPalette = {
  primary: {
    main: '#0A84FF', // Slightly brighter Apple blue for dark mode
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#5E5CE6', // Slightly brighter Apple purple
    contrastText: '#ffffff',
  },
  background: {
    default: '#000000', // Black background
    paper: '#1c1c1e',   // Dark grey for card/paper backgrounds
  },
  text: {
    primary: '#ffffff', // White
    secondary: '#8e8e93', // Lighter grey
  },
  divider: 'rgba(255, 255, 255, 0.15)',
};

// --- Common Typography & Component Overrides ---
const commonSettings = (mode) => ({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    // Consistent Paper/Card styles for both modes
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove gradient background if any by default
          boxShadow: mode === 'light' ? '0 1px 3px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.3)', // Subtle shadow
          borderRadius: '12px', // More rounded corners
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'light' ? '0 1px 3px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.3)',
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        },
        containedSecondary: {
          boxShadow: 'none',
           '&:hover': {
            boxShadow: 'none',
          }
        }
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
           // We'll add blur/transparency later here or in the component sx prop
          boxShadow: 'none', // Remove default AppBar shadow, we'll use border/blur
          backgroundImage: 'none',
        },
      },
    },
     MuiDrawer: {
        styleOverrides: {
          paper: {
            // We'll add blur/transparency later here or in the component sx prop
             borderRight: 'none', // Remove default border
          }
        }
     }
    // Add other component overrides as needed
  },
  shape: {
    borderRadius: 12, // Global border radius adjustment
  }
});

// --- Theme Creation Function ---
export const getAppTheme = (mode) => {
  const palette = mode === 'light' ? lightPalette : darkPalette;
  return createTheme({
    palette: {
      mode: mode, // Important: sets the mode for MUI internal logic
      ...palette,
    },
    ...commonSettings(mode),
  });
}; 