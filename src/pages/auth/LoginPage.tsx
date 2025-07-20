import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
  Slide,
  Grow,
  Zoom,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/useAuthStore';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuthStore();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockUser = {
        id: '1',
        name: 'Admin User',
        email: formData.email,
        role: 'admin',
        avatar: 'AU',
      };
      const mockToken = 'mock-jwt-token';
      login(mockUser, mockToken);
      setIsLoading(false);
      setShowSuccess(true);
      
      // Hide success animation after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 70%, rgba(59, 136, 128, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(74, 154, 145, 0.12) 0%, transparent 50%)',
          animation: 'dramaticFloat 15s ease-in-out infinite',
          '@keyframes dramaticFloat': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
            '25%': { transform: 'translate(-30px, -20px) scale(1.1) rotate(5deg)' },
            '50%': { transform: 'translate(20px, -40px) scale(0.9) rotate(-5deg)' },
            '75%': { transform: 'translate(-15px, 30px) scale(1.05) rotate(3deg)' },
          },
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            conic-gradient(from 0deg at 20% 80%, rgba(59, 136, 128, 0.2) 0deg, transparent 60deg, transparent 300deg, rgba(74, 154, 145, 0.15) 360deg),
            conic-gradient(from 180deg at 80% 20%, rgba(47, 107, 100, 0.12) 0deg, transparent 60deg, transparent 300deg, rgba(59, 136, 128, 0.18) 360deg)
          `,
          animation: 'conicRotate 20s linear infinite',
          '@keyframes conicRotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        },
      }}
    >
      {/* Success Confetti */}
      {showSuccess && [...Array(80)].map((_, index) => (
        <Box
          key={`confetti-${index}`}
          sx={{
            position: 'absolute',
            width: Math.random() * 12 + 6,
            height: Math.random() * 12 + 6,
            background: [
              '#3B8880',
              '#4A9A91',
              '#2F6B64',
              '#10B981',
              '#059669',
              '#047857',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6'
            ][Math.floor(Math.random() * 9)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            animation: `confettiFall ${Math.random() * 4 + 2}s linear forwards`,
            animationDelay: `${Math.random() * 3}s`,
            left: `${Math.random() * 100}%`,
            top: '-10px',
            zIndex: 1000,
            '@keyframes confettiFall': {
              '0%': {
                transform: 'translateY(-10px) rotate(0deg) scale(0)',
                opacity: 1,
              },
              '10%': {
                transform: 'translateY(10vh) rotate(36deg) scale(1)',
                opacity: 1,
              },
              '100%': {
                transform: `translateY(100vh) rotate(${Math.random() * 720}deg) scale(0.5)`,
                opacity: 0,
              },
            },
          }}
        />
      ))}

      {/* Success Sparkles */}
      {showSuccess && [...Array(30)].map((_, index) => (
        <Box
          key={`sparkle-${index}`}
          sx={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: '#FFD700',
            borderRadius: '50%',
            animation: `sparkleTwinkle ${Math.random() * 2 + 1}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            zIndex: 1000,
            '@keyframes sparkleTwinkle': {
              '0%, 100%': {
                opacity: 0,
                transform: 'scale(0) rotate(0deg)',
              },
              '50%': {
                opacity: 1,
                transform: 'scale(1.5) rotate(180deg)',
              },
            },
          }}
        />
      ))}

      {/* Success Celebration Rings */}
      {showSuccess && [...Array(5)].map((_, index) => (
        <Box
          key={`celebration-ring-${index}`}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 0,
            height: 0,
            borderRadius: '50%',
            border: `4px solid ${['#3B8880', '#4A9A91', '#10B981', '#F59E0B', '#8B5CF6'][index]}`,
            transform: 'translate(-50%, -50%)',
            animation: `celebrationRing ${2.5 + index * 0.4}s ease-out forwards`,
            animationDelay: `${index * 0.2}s`,
            zIndex: 999,
            '@keyframes celebrationRing': {
              '0%': {
                width: 0,
                height: 0,
                opacity: 1,
              },
              '100%': {
                width: '400px',
                height: '400px',
                opacity: 0,
              },
            },
          }}
        />
      ))}

      {/* Success Message Overlay */}
      {showSuccess && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Zoom in={showSuccess} timeout={500}>
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: 6,
                p: 5,
                textAlign: 'center',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
                animation: 'successBounce 0.8s ease-out',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)',
                  animation: 'successShimmer 2s ease-in-out infinite',
                  '@keyframes successShimmer': {
                    '0%': { left: '-100%' },
                    '50%': { left: '100%' },
                    '100%': { left: '100%' },
                  },
                },
                '@keyframes successBounce': {
                  '0%': { transform: 'scale(0.3) rotate(-15deg)' },
                  '50%': { transform: 'scale(1.15) rotate(8deg)' },
                  '100%': { transform: 'scale(1) rotate(0deg)' },
                },
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: 100,
                  color: '#10B981',
                  mb: 3,
                  animation: 'successIconPulse 1.5s ease-in-out infinite',
                  filter: 'drop-shadow(0 8px 20px rgba(16, 185, 129, 0.3))',
                  '@keyframes successIconPulse': {
                    '0%, 100%': { 
                      transform: 'scale(1) rotate(0deg)',
                      filter: 'drop-shadow(0 8px 20px rgba(16, 185, 129, 0.3))',
                    },
                    '50%': { 
                      transform: 'scale(1.2) rotate(5deg)',
                      filter: 'drop-shadow(0 12px 30px rgba(16, 185, 129, 0.5))',
                    },
                  },
                }}
              />
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#10B981', 
                  fontWeight: 800, 
                  mb: 2,
                  animation: 'successTextGlow 2s ease-in-out infinite',
                  '@keyframes successTextGlow': {
                    '0%, 100%': { 
                      textShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
                    },
                    '50%': { 
                      textShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
                    },
                  },
                }}
              >
                Welcome Back!
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#6B7280',
                  animation: 'successSubtextFade 1s ease-out 0.5s both',
                  '@keyframes successSubtextFade': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                Successfully signed in
              </Typography>
            </Box>
          </Zoom>
        </Box>
      )}

      {/* Dramatic Flowing Shapes */}
      {[...Array(8)].map((_, index) => (
        <Box
          key={`dramatic-flow-${index}`}
          sx={{
            position: 'absolute',
            width: Math.random() * 300 + 150,
            height: Math.random() * 300 + 150,
            borderRadius: '50%',
            background: `linear-gradient(45deg, rgba(59, 136, 128, 0.2), rgba(74, 154, 145, 0.15))`,
            filter: 'blur(50px)',
            animation: `dramaticFlow ${Math.random() * 15 + 20}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 10}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '@keyframes dramaticFlow': {
              '0%, 100%': {
                transform: 'translate(0, 0) scale(1) rotate(0deg)',
                opacity: 0.4,
              },
              '25%': {
                transform: 'translate(80px, -50px) scale(1.5) rotate(90deg)',
                opacity: 0.8,
              },
              '50%': {
                transform: 'translate(-60px, 80px) scale(0.6) rotate(180deg)',
                opacity: 0.6,
              },
              '75%': {
                transform: 'translate(-80px, -40px) scale(1.3) rotate(270deg)',
                opacity: 0.9,
              },
            },
          }}
        />
      ))}

      {/* Bold Flowing Lines */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={`bold-line-${index}`}
          sx={{
            position: 'absolute',
            width: '4px',
            height: Math.random() * 400 + 250,
            background: `linear-gradient(to bottom, transparent, rgba(59, 136, 128, 0.6), rgba(74, 154, 145, 0.4), transparent)`,
            borderRadius: '2px',
            animation: `boldFlowLine ${Math.random() * 12 + 18}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 8}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            '@keyframes boldFlowLine': {
              '0%, 100%': {
                transform: `rotate(${Math.random() * 360}deg) translateY(0) scaleY(1)`,
                opacity: 0.3,
              },
              '50%': {
                transform: `rotate(${Math.random() * 360 + 180}deg) translateY(-80px) scaleY(2)`,
                opacity: 0.8,
              },
            },
          }}
        />
      ))}

      {/* Dynamic Theme Particles */}
      {[...Array(20)].map((_, index) => (
        <Box
          key={`dynamic-particle-${index}`}
          sx={{
            position: 'absolute',
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: `linear-gradient(45deg, #3B8880, #4A9A91)`,
            borderRadius: '50%',
            opacity: 0.6,
            animation: `dynamicParticle ${Math.random() * 10 + 15}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '@keyframes dynamicParticle': {
              '0%': {
                transform: 'translateY(100vh) rotate(0deg) scale(0)',
                opacity: 0,
              },
              '10%': { 
                opacity: 0.6,
                transform: 'translateY(90vh) rotate(36deg) scale(1)',
              },
              '50%': {
                transform: 'translateY(50vh) rotate(180deg) scale(1.5)',
                opacity: 0.8,
              },
              '90%': { 
                opacity: 0.6,
                transform: 'translateY(-10vh) rotate(324deg) scale(1)',
              },
              '100%': {
                transform: 'translateY(-20vh) rotate(360deg) scale(0)',
                opacity: 0,
              },
            },
          }}
        />
      ))}

      {/* Morphing Curved Shapes */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={`morph-curve-${index}`}
          sx={{
            position: 'absolute',
            width: Math.random() * 250 + 150,
            height: Math.random() * 250 + 150,
            borderRadius: '50% 50% 50% 50% / 60% 40% 60% 40%',
            background: `linear-gradient(135deg, rgba(59, 136, 128, 0.15), rgba(74, 154, 145, 0.1))`,
            filter: 'blur(40px)',
            animation: `morphCurve ${Math.random() * 20 + 25}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 15}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '@keyframes morphCurve': {
              '0%, 100%': {
                transform: 'translate(0, 0) scale(1) rotate(0deg)',
                borderRadius: '50% 50% 50% 50% / 60% 40% 60% 40%',
              },
              '16.66%': {
                transform: 'translate(60px, -30px) scale(1.4) rotate(60deg)',
                borderRadius: '40% 60% 60% 40% / 50% 50% 50% 50%',
              },
              '33.33%': {
                transform: 'translate(-40px, 60px) scale(0.7) rotate(120deg)',
                borderRadius: '60% 40% 40% 60% / 50% 50% 50% 50%',
              },
              '50%': {
                transform: 'translate(-60px, -50px) scale(1.2) rotate(180deg)',
                borderRadius: '50% 50% 50% 50% / 40% 60% 40% 60%',
              },
              '66.66%': {
                transform: 'translate(50px, 40px) scale(0.8) rotate(240deg)',
                borderRadius: '30% 70% 70% 30% / 60% 40% 60% 40%',
              },
              '83.33%': {
                transform: 'translate(-30px, -60px) scale(1.3) rotate(300deg)',
                borderRadius: '70% 30% 30% 70% / 40% 60% 40% 60%',
              },
            },
          }}
        />
      ))}

      {/* Centered Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 450,
          mx: 'auto',
          p: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Slide direction="up" in={true} timeout={1200}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Logo and Title */}
            <Fade in={true} timeout={1500}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                {/* Logo with Dramatic Drawing Animation */}
                <Box
                  sx={{
                    position: 'relative',
                    mb: 2,
                    animation: 'dramaticLogoEntrance 2.5s ease-out',
                    '@keyframes dramaticLogoEntrance': {
                      '0%': {
                        transform: 'scale(0) rotate(-360deg)',
                        opacity: 0,
                      },
                      '30%': {
                        transform: 'scale(1.5) rotate(-180deg)',
                        opacity: 0.6,
                      },
                      '60%': {
                        transform: 'scale(0.8) rotate(0deg)',
                        opacity: 0.9,
                      },
                      '100%': {
                        transform: 'scale(1) rotate(0deg)',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Box
                    component="img"
                    src="/project_logo.png"
                    alt="Logo"
                    sx={{
                      width: 140,
                      height: 140,
                      display: 'block',
                      mx: 'auto',
                      filter: 'drop-shadow(0 12px 30px rgba(59, 136, 128, 0.3))',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        right: -8,
                        bottom: -8,
                        background: 'conic-gradient(from 0deg, #3B8880, #4A9A91, #2F6B64, #3B8880)',
                        borderRadius: '50%',
                        zIndex: -1,
                        opacity: 0,
                        animation: 'dramaticLogoGlow 2s ease-in-out infinite',
                        '@keyframes dramaticLogoGlow': {
                          '0%, 100%': { 
                            opacity: 0,
                            transform: 'rotate(0deg) scale(1)',
                          },
                          '50%': { 
                            opacity: 0.5,
                            transform: 'rotate(180deg) scale(1.2)',
                          },
                        },
                      },
                      '&:hover': {
                        transform: 'scale(1.15) rotate(8deg)',
                        filter: 'drop-shadow(0 20px 40px rgba(59, 136, 128, 0.4))',
                        '&::before': {
                          animation: 'dramaticLogoGlow 0.8s ease-in-out infinite',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Company Name with Bold Flow Animation */}
                <Box
                  sx={{
                    overflow: 'hidden',
                    mb: 0.5,
                    animation: 'boldTextReveal 2s ease-out 0.8s both',
                    '@keyframes boldTextReveal': {
                      '0%': {
                        transform: 'translateX(-150%) scale(0.8)',
                        opacity: 0,
                      },
                      '50%': {
                        transform: 'translateX(-50%) scale(1.1)',
                        opacity: 0.7,
                      },
                      '100%': {
                        transform: 'translateX(0) scale(1)',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: '#2d3748',
                      fontFamily: 'Arial, sans-serif',
                      background: 'linear-gradient(135deg, #3B8880 0%, #4A9A91 25%, #2F6B64 50%, #4A9A91 75%, #3B8880 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '300% 300%',
                      animation: 'boldTextFlow 3s ease-in-out infinite',
                      '@keyframes boldTextFlow': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                      },
                    }}
                  >
                    MyaSattYaung
                  </Typography>
                </Box>

                {/* Chinese Text with Dramatic Fade */}
                <Box
                  sx={{
                    animation: 'dramaticFade 2.5s ease-out 1.5s both',
                    '@keyframes dramaticFade': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(40px) scale(0.8) rotate(-5deg)',
                      },
                      '50%': {
                        opacity: 0.6,
                        transform: 'translateY(20px) scale(1.1) rotate(2deg)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0) scale(1) rotate(0deg)',
                      },
                    },
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#4a5568',
                      fontWeight: 400,
                      mb: 2,
                      fontFamily: 'Arial, sans-serif',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        left: '50%',
                        width: 0,
                        height: 3,
                        background: 'linear-gradient(90deg, #3B8880, #4A9A91, #2F6B64)',
                        transform: 'translateX(-50%)',
                        animation: 'boldUnderlineGrow 2.5s ease-out 2.5s forwards',
                        '@keyframes boldUnderlineGrow': {
                          '0%': { width: 0 },
                          '50%': { width: '60%' },
                          '100%': { width: '90%' },
                        },
                      },
                    }}
                  >
                    通达・房地产公司
                  </Typography>
                </Box>
              </Box>
            </Fade>

            {/* Login Form with Dramatic Entrance */}
            <Fade in={true} timeout={2000}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  width: '100%',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: showSuccess 
                    ? '0 25px 50px rgba(0, 0, 0, 0.08), 0 0 30px rgba(16, 185, 129, 0.3)'
                    : '0 25px 50px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'dramaticFormEntrance 2s ease-out 2s both',
                  '@keyframes dramaticFormEntrance': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(50px) scale(0.8) rotate(-2deg)',
                    },
                    '50%': {
                      opacity: 0.7,
                      transform: 'translateY(25px) scale(1.1) rotate(1deg)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0) scale(1) rotate(0deg)',
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: showSuccess
                      ? 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.15), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(59, 136, 128, 0.1), transparent)',
                    animation: showSuccess
                      ? 'successFormShimmer 3s ease-in-out infinite'
                      : 'dramaticFormShimmer 6s ease-in-out infinite',
                    '@keyframes successFormShimmer': {
                      '0%': { left: '-100%' },
                      '50%': { left: '100%' },
                      '100%': { left: '100%' },
                    },
                    '@keyframes dramaticFormShimmer': {
                      '0%': { left: '-100%' },
                      '50%': { left: '100%' },
                      '100%': { left: '100%' },
                    },
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.03)',
                    boxShadow: showSuccess
                      ? '0 40px 80px rgba(0, 0, 0, 0.15), 0 0 40px rgba(16, 185, 129, 0.4)'
                      : '0 40px 80px rgba(0, 0, 0, 0.15)',
                    '&::before': {
                      animation: showSuccess
                        ? 'successFormShimmer 1.5s ease-in-out infinite'
                        : 'dramaticFormShimmer 2s ease-in-out infinite',
                    },
                  },
                }}
              >
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  {/* Email Field */}
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
                    onKeyPress={handleKeyPress}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ 
                            color: 'primary.main',
                            transition: 'all 0.4s ease',
                            '&:hover': { transform: 'scale(1.3) rotate(15deg)' }
                          }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.4s ease',
                        background: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.02)',
                          boxShadow: '0 12px 35px rgba(59, 136, 128, 0.2)',
                          background: 'rgba(255, 255, 255, 0.95)',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 3,
                          },
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-5px) scale(1.02)',
                          boxShadow: '0 15px 45px rgba(59, 136, 128, 0.3)',
                          background: 'rgba(255, 255, 255, 1)',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 3,
                          },
                        },
                      },
                    }}
                  />

                  {/* Password Field */}
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
                    onKeyPress={handleKeyPress}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ 
                            color: 'primary.main',
                            transition: 'all 0.4s ease',
                            '&:hover': { transform: 'scale(1.3) rotate(-15deg)' }
                          }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ 
                              color: 'primary.main',
                              transition: 'all 0.4s ease',
                              '&:hover': { 
                                transform: 'scale(1.3)',
                                backgroundColor: 'rgba(59, 136, 128, 0.15)'
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.4s ease',
                        background: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.02)',
                          boxShadow: '0 12px 35px rgba(59, 136, 128, 0.2)',
                          background: 'rgba(255, 255, 255, 0.95)',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 3,
                          },
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-5px) scale(1.02)',
                          boxShadow: '0 15px 45px rgba(59, 136, 128, 0.3)',
                          background: 'rgba(255, 255, 255, 1)',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 3,
                          },
                        },
                      },
                    }}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <LoginIcon />
                      )
                    }
                    sx={{
                      mt: 4,
                      mb: 2,
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      background: showSuccess 
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 25%, #047857 50%, #059669 75%, #10B981 100%)'
                        : 'linear-gradient(135deg, #3B8880 0%, #4A9A91 25%, #2F6B64 50%, #4A9A91 75%, #3B8880 100%)',
                      backgroundSize: '300% 300%',
                      boxShadow: showSuccess 
                        ? '0 15px 45px rgba(16, 185, 129, 0.5)'
                        : '0 12px 35px rgba(59, 136, 128, 0.4)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: showSuccess 
                        ? 'successButtonPulse 1s ease-in-out infinite'
                        : 'buttonPulse 3s ease-in-out infinite',
                      '@keyframes successButtonPulse': {
                        '0%, 100%': { 
                          backgroundPosition: '0% 50%',
                          boxShadow: '0 15px 45px rgba(16, 185, 129, 0.5)',
                          transform: 'scale(1)',
                        },
                        '50%': { 
                          backgroundPosition: '100% 50%',
                          boxShadow: '0 20px 55px rgba(16, 185, 129, 0.7)',
                          transform: 'scale(1.05)',
                        },
                      },
                      '@keyframes buttonPulse': {
                        '0%, 100%': { 
                          backgroundPosition: '0% 50%',
                          boxShadow: '0 12px 35px rgba(59, 136, 128, 0.4)',
                        },
                        '50%': { 
                          backgroundPosition: '100% 50%',
                          boxShadow: '0 15px 45px rgba(59, 136, 128, 0.6)',
                        },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: showSuccess
                          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                          : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        transition: 'left 0.8s ease',
                      },
                      '&:hover': {
                        background: showSuccess
                          ? 'linear-gradient(135deg, #059669 0%, #047857 25%, #065F46 50%, #047857 75%, #059669 100%)'
                          : 'linear-gradient(135deg, #2F6B64 0%, #3B8880 25%, #4A9A91 50%, #3B8880 75%, #2F6B64 100%)',
                        boxShadow: showSuccess
                          ? '0 20px 55px rgba(16, 185, 129, 0.6)'
                          : '0 18px 50px rgba(59, 136, 128, 0.5)',
                        transform: 'translateY(-5px) scale(1.05)',
                        '&::before': {
                          left: '100%',
                        },
                      },
                      '&:active': {
                        transform: 'translateY(-2px) scale(1.02)',
                      },
                      '&:disabled': {
                        background: showSuccess
                          ? 'linear-gradient(135deg, #10B981 0%, #059669 25%, #047857 50%, #059669 75%, #10B981 100%)'
                          : 'linear-gradient(135deg, #3B8880 0%, #4A9A91 25%, #2F6B64 50%, #4A9A91 75%, #3B8880 100%)',
                        opacity: 0.7,
                      },
                    }}
                  >
                    {isLoading ? 'Signing In...' : showSuccess ? 'Success!' : 'Sign In'}
                  </Button>
                </Box>
              </Paper>
            </Fade>

            {/* Footer with Dynamic Pulse */}
            <Fade in={true} timeout={2500}>
              <Typography
                variant="body2"
                sx={{
                  mt: 3,
                  color: '#718096',
                  textAlign: 'center',
                  animation: 'dynamicPulse 2s ease-in-out infinite',
                  '@keyframes dynamicPulse': {
                    '0%, 100%': { 
                      opacity: 0.5,
                      transform: 'scale(1)',
                    },
                    '50%': { 
                      opacity: 1,
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                © 2024 Admin Panel. All rights reserved.
              </Typography>
            </Fade>
          </Box>
        </Slide>
      </Box>
    </Box>
  );
};

export default LoginPage; 