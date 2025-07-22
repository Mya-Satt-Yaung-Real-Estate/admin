import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';

export interface StatCard {
  title: string;
  value: string | number;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface StatisticsCardsProps {
  cards: StatCard[];
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function StatisticsCards({ 
  cards, 
  columns = { xs: 12, sm: 6, md: 3, lg: 3 } 
}: StatisticsCardsProps) {
  const theme = useTheme();

  const getColorValue = (color?: string) => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid item key={index} {...columns}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    component="div"
                    sx={{ 
                      color: getColorValue(card.color),
                      fontWeight: 600,
                    }}
                  >
                    {card.value}
                  </Typography>
                  {card.subtitle && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {card.subtitle}
                    </Typography>
                  )}
                  {card.trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: card.trend.isPositive ? 'success.main' : 'error.main',
                          fontWeight: 500,
                        }}
                      >
                        {card.trend.isPositive ? '+' : ''}{card.trend.value}%
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                        from last month
                      </Typography>
                    </Box>
                  )}
                </Box>
                {card.icon && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: `${getColorValue(card.color)}15`,
                      color: getColorValue(card.color),
                    }}
                  >
                    {card.icon}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 