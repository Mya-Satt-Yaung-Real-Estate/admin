import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Cached as CacheIcon,
  Home as PropertyIcon,
  Image as MediaIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface ConfigurationCategoryCardProps {
  category: string;
  totalSettings: number;
  activeSettings: number;
  onClick: () => void;
  isLoading?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'point_system':
      return <TrendingUpIcon />;
    case 'trial_points':
      return <StarIcon />;
    case 'cache':
      return <CacheIcon />;
    case 'property':
      return <PropertyIcon />;
    case 'media':
      return <MediaIcon />;
    default:
      return <SettingsIcon />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'point_system':
      return '#2196F3'; // Blue
    case 'trial_points':
      return '#FF9800'; // Orange
    case 'cache':
      return '#FF5722'; // Deep Orange
    case 'property':
      return '#009688'; // Teal
    case 'media':
      return '#FFC107'; // Amber
    default:
      return '#757575'; // Grey
  }
};

const getCategoryDisplayName = (category: string) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ConfigurationCategoryCard: React.FC<ConfigurationCategoryCardProps> = ({
  category,
  totalSettings,
  activeSettings,
  onClick,
  isLoading = false,
}) => {
  const icon = getCategoryIcon(category);
  const color = getCategoryColor(category);
  const displayName = getCategoryDisplayName(category);
  const inactiveSettings = totalSettings - activeSettings;

  return (
    <Card
      sx={{
        minHeight: 100,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid transparent`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          borderColor: color,
        },
        position: 'relative',
        overflow: 'visible',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
        {/* Category Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: `${color}15`,
            color: color,
            margin: '0 auto 8px',
            fontSize: 20,
          }}
        >
          {icon}
        </Box>

        {/* Category Name */}
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            color: 'text.primary',
            fontSize: '0.85rem',
          }}
        >
          {displayName}
        </Typography>

        {/* Settings Count */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            mb: 1,
            display: 'block',
          }}
        >
          {totalSettings} settings
        </Typography>

        {/* Status Indicators */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1 }}>
          {activeSettings > 0 && (
            <Chip
              label={`${activeSettings}`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 18 }}
            />
          )}
          {inactiveSettings > 0 && (
            <Chip
              label={`${inactiveSettings}`}
              size="small"
              color="default"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 18 }}
            />
          )}
        </Box>

        {/* Manage Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            color: color,
            fontWeight: 500,
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Manage</Typography>
          <ArrowForwardIcon sx={{ fontSize: 12 }} />
        </Box>
      </CardContent>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default ConfigurationCategoryCard;
