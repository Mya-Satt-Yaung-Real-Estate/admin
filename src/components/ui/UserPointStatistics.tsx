import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

interface UserPointStatisticsProps {
  pointBalance: number;
  totalPointsAllocated: number;
  totalPointsConsumed: number;
  pointPackagesCount: number;
}

const UserPointStatistics: React.FC<UserPointStatisticsProps> = ({
  pointBalance,
  totalPointsAllocated,
  totalPointsConsumed,
  pointPackagesCount,
}) => {
  const consumptionPercentage = totalPointsAllocated > 0 
    ? (totalPointsConsumed / totalPointsAllocated) * 100 
    : 0;

  const utilizationPercentage = totalPointsAllocated > 0 
    ? (pointBalance / totalPointsAllocated) * 100 
    : 0;

  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'error';
    if (balance < 50) return 'warning';
    return 'success';
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
          Point Statistics
        </Typography>

        <Grid container spacing={3}>
          {/* Current Balance */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <BalanceIcon color={getBalanceColor(pointBalance)} sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight="700" color={getBalanceColor(pointBalance)}>
                  {pointBalance.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Current Balance
              </Typography>
              <Chip
                label={pointBalance === 0 ? 'No Points' : pointBalance < 50 ? 'Low Balance' : 'Good Balance'}
                color={getBalanceColor(pointBalance)}
                size="small"
              />
            </Box>
          </Grid>

          {/* Total Allocated */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight="700" color="primary">
                  {totalPointsAllocated.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Allocated
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Lifetime points received
              </Typography>
            </Box>
          </Grid>

          {/* Total Consumed */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TrendingDownIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight="700" color="info.main">
                  {totalPointsConsumed.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Consumed
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Lifetime points used
              </Typography>
            </Box>
          </Grid>

          {/* Packages Count */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <ShoppingCartIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight="700" color="secondary">
                  {pointPackagesCount}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Packages
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total packages purchased
              </Typography>
            </Box>
          </Grid>

          {/* Consumption Progress */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Consumption Rate
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {consumptionPercentage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={consumptionPercentage}
                color={getConsumptionColor(consumptionPercentage)}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="caption" color="textSecondary">
                {totalPointsConsumed.toLocaleString()} of {totalPointsAllocated.toLocaleString()} points consumed
              </Typography>
            </Box>
          </Grid>

          {/* Utilization Progress */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Current Utilization
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {utilizationPercentage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={utilizationPercentage}
                color="success"
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="caption" color="textSecondary">
                {pointBalance.toLocaleString()} of {totalPointsAllocated.toLocaleString()} points remaining
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserPointStatistics;
