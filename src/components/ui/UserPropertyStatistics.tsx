import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface UserPropertyStatisticsProps {
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  expiredProperties: number;
  draftProperties: number;
}

const UserPropertyStatistics: React.FC<UserPropertyStatisticsProps> = ({
  totalProperties,
  activeProperties,
  soldProperties,
  rentedProperties,
  expiredProperties,
  draftProperties,
}) => {


  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeIcon color="primary" />
          Property Statistics
        </Typography>

        <Grid container spacing={3}>
          {/* Total Properties */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <HomeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight="700" color="primary">
                  {totalProperties.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Properties
              </Typography>
              <Typography variant="caption" color="textSecondary">
                All properties owned
              </Typography>
            </Box>
          </Grid>

          {/* Active Properties */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight="700" color="success.main">
                  {activeProperties.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Active Properties
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Currently available
              </Typography>
            </Box>
          </Grid>

          {/* Sold Properties */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight="700" color="primary">
                  {soldProperties.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Sold Properties
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Successfully sold
              </Typography>
            </Box>
          </Grid>

          {/* Rented Properties */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <HomeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight="700" color="info.main">
                  {rentedProperties.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Rented Properties
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Currently rented
              </Typography>
            </Box>
          </Grid>



          {/* Additional Stats */}
          <Grid item xs={12}>
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: 'background.default', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Expired Properties
                  </Typography>
                  <Typography variant="h6" color="warning.main" fontWeight="600">
                    {expiredProperties.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Draft Properties
                  </Typography>
                  <Typography variant="h6" color="text.secondary" fontWeight="600">
                    {draftProperties.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Success Rate
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight="600">
                    {totalProperties > 0 
                      ? Math.round(((soldProperties + rentedProperties) / totalProperties) * 100)
                      : 0
                    }%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserPropertyStatistics;
