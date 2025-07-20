import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UserManagementPage from './pages/users/UserManagementPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SettingsPage from './pages/settings/SettingsPage';
import { useAuthStore } from './stores/useAuthStore';
import './index.css';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
              <Route path="/" element={isAuthenticated ? <AdminLayout><DashboardPage /></AdminLayout> : <Navigate to="/login" replace />} />
              <Route path="/users" element={isAuthenticated ? <AdminLayout><UserManagementPage /></AdminLayout> : <Navigate to="/login" replace />} />
              <Route path="/analytics" element={isAuthenticated ? <AdminLayout><AnalyticsPage /></AdminLayout> : <Navigate to="/login" replace />} />
              <Route path="/settings" element={isAuthenticated ? <AdminLayout><SettingsPage /></AdminLayout> : <Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
