import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    brand?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: '#3B8880', // Brand color
      light: '#4A9A91', // Lighter variation
      dark: '#2F6B64', // Darker variation
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F59E0B', // Warm amber accent
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    brand: {
      main: '#3B8880', // Brand color for specific use cases
      light: '#4A9A91',
      dark: '#2F6B64',
      contrastText: '#ffffff',
    },
    neutral: {
      main: '#64748B',
      light: '#94A3B8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B', // Dark gray text
      secondary: '#64748B', // Medium gray text
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#1E293B',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1E293B',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1E293B',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1E293B',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1E293B',
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1E293B',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#1E293B',
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#64748B',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#64748B',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1E293B',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          },
        },
        containedPrimary: {
          backgroundColor: '#3B8880',
          '&:hover': {
            backgroundColor: '#2F6B64',
          },
        },
        outlinedPrimary: {
          borderColor: '#3B8880',
          color: '#3B8880',
          '&:hover': {
            backgroundColor: 'rgba(59, 136, 128, 0.04)',
            borderColor: '#2F6B64',
          },
        },
        textPrimary: {
          color: '#3B8880',
          '&:hover': {
            backgroundColor: 'rgba(59, 136, 128, 0.04)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          padding: '12px 16px',
        },
        head: {
          backgroundColor: '#F8FAFC',
          fontWeight: 600,
          color: '#1E293B',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: '#3B8880',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#2F6B64',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#E2E8F0',
          borderRadius: 4,
        },
        barColorPrimary: {
          backgroundColor: '#3B8880',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        colorPrimary: {
          color: '#3B8880',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#3B8880',
            '& + .MuiSwitch-track': {
              backgroundColor: '#3B8880',
            },
          },
        },
      },
    },
  },
});

export default theme; 