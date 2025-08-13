import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useLogin } from '../../services/queries/auth';
import { useAuthStore } from '../../stores/useAuthStore';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'admin@myasattyaung.com',
    password: 'password',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string>('');
  const { login } = useAuthStore();
  
  // Use React Query login hook
  const loginMutation = useLogin();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    setGeneralError(''); // Clear general error when validating
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clear previous errors
    setErrors({});
    setGeneralError('');

    try {
      const result = await loginMutation.mutateAsync(formData);
      
      // The React Query hook should handle storing the data
      // We just need to call the auth store login function
      if (result.data?.user && result.data?.token) {
        login(result.data.user, result.data.token);
      } else {
        setGeneralError('Unexpected response format from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle API validation errors
      if (error.errors) {
        const fieldErrors: { email?: string; password?: string } = {};
        
        // Handle field-specific errors
        if (error.errors.email && error.errors.email.length > 0) {
          fieldErrors.email = error.errors.email[0];
        }
        if (error.errors.password && error.errors.password.length > 0) {
          fieldErrors.password = error.errors.password[0];
        }
        
        setErrors(fieldErrors);
        
        // Set general error message if no field-specific errors
        if (Object.keys(fieldErrors).length === 0 && error.message) {
          setGeneralError(error.message);
        }
      } else {
        // Handle general errors
        setGeneralError(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError('');
    }
  };

  // Check if there are any errors to display
  const hasErrors = Object.values(errors).some(error => error) || generalError || loginMutation.error;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 400,
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/project_logo.png"
            alt="Logo"
            sx={{
              width: 80,
              height: 80,
              display: 'block',
              mx: 'auto',
              mb: 2,
            }}
          />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#2d3748', 
              mb: 1,
            }}
          >
            MyaSattYaung
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#4a5568',
            }}
          >
            通达・房地产公司
          </Typography>
        </Box>

        {/* Login Form */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            width: '100%',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {hasErrors && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {generalError || 
                 loginMutation.error?.message || 
                 'Please check your credentials and try again.'}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loginMutation.isPending}
              startIcon={
                loginMutation.isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LoginIcon />
                )
              }
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            color: '#718096',
            textAlign: 'center',
          }}
        >
          © 2024 Admin Panel. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage; 