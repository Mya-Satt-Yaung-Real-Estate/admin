import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import { router } from './routes';
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
