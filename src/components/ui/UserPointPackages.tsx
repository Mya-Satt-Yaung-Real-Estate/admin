import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import {
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { UserPointPackage } from '../../types/user';
import { formatDate } from '../../constants/dateFormats';

interface UserPointPackagesProps {
  pointPackages: UserPointPackage[];
}

const UserPointPackages: React.FC<UserPointPackagesProps> = ({ pointPackages }) => {
  const getStatusColor = (pkg: UserPointPackage) => {
    if (pkg.is_expired) return 'error';
    if (pkg.days_until_expiry <= 7) return 'warning';
    return 'success';
  };

  const getStatusIcon = (pkg: UserPointPackage) => {
    if (pkg.is_expired) return <WarningIcon />;
    if (pkg.days_until_expiry <= 7) return <ScheduleIcon />;
    return <CheckCircleIcon />;
  };

  const getConsumptionColor = (percentage: number) => {
    if (percentage >= 80) return 'error';
    if (percentage >= 60) return 'warning';
    return 'success';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon color="primary" />
          Point Packages ({pointPackages.length})
        </Typography>

        {pointPackages.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
            No point packages found
          </Typography>
        ) : (
          <List>
            {pointPackages.map((pkg, index) => (
              <React.Fragment key={pkg.id}>
                <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <Box sx={{ width: '100%' }}>
                    {/* Package Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {pkg.package_name}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(pkg)}
                        label={pkg.is_expired ? 'Expired' : `${pkg.days_until_expiry} days left`}
                        color={getStatusColor(pkg)}
                        size="small"
                      />
                    </Box>

                    {/* Points Information */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight="600">
                            {pkg.points_allocated.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Total Allocated
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main" fontWeight="600">
                            {pkg.points_remaining.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Remaining
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="info.main" fontWeight="600">
                            {pkg.points_consumed.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Consumed
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Consumption Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          Consumption
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {pkg.consumption_percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pkg.consumption_percentage}
                        color={getConsumptionColor(pkg.consumption_percentage)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    {/* Package Details */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="textSecondary">
                            Allocated: {formatDate(pkg.allocated_at, 'display')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="textSecondary">
                            Expires: {formatDate(pkg.expires_at, 'display')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="textSecondary">
                            Allocated by: {pkg.allocated_by.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            {pkg.allocated_by.email}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </ListItem>
                {index < pointPackages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPointPackages;
