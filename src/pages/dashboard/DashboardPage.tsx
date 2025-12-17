import React, { useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Event as EventIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Feedback as FeedbackIcon,
  ContactMail as ContactMailIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { useDashboardStatistics } from '../../services/queries';

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

// Format currency (MMK)
const formatCurrency = (num: number): string => {
  return `${formatNumber(Math.round(num))} MMK`;
};

const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useDashboardStatistics();

  const statsCards: StatCard[] = useMemo(() => {
    if (!data?.data) return [];

    const stats = data.data;

    return [
      {
        title: 'Total Company',
        value: formatNumber(stats.total_company),
        color: 'primary',
        icon: <BusinessIcon />,
      },
      {
        title: 'Total Individual User',
        value: formatNumber(stats.total_individual_user),
        color: 'primary',
        icon: <PeopleIcon />,
      },
      {
        title: 'Total Property',
        value: formatNumber(stats.total_property),
        color: 'info',
        icon: <HomeIcon />,
      },
      {
        title: 'Total Wanting List',
        value: formatNumber(stats.total_wanting_list),
        color: 'info',
        icon: <SearchIcon />,
      },
      {
        title: 'Total Appointment',
        value: formatNumber(stats.total_appointment),
        color: 'secondary',
        icon: <EventIcon />,
      },
      {
        title: 'Credited Point',
        value: formatNumber(stats.credited_point),
        color: 'success',
        icon: <AddCircleIcon />,
      },
      {
        title: 'Debit Point',
        value: formatNumber(stats.debit_point),
        color: 'error',
        icon: <RemoveCircleIcon />,
      },
      {
        title: 'Total Revenue from Payment',
        value: formatCurrency(stats.total_revenue_from_payment),
        color: 'success',
        icon: <AttachMoneyIcon />,
      },
      {
        title: 'Total Feedback',
        value: formatNumber(stats.total_feedback),
        color: 'warning',
        icon: <FeedbackIcon />,
      },
      {
        title: 'Total Contact Us',
        value: formatNumber(stats.total_contactus),
        color: 'warning',
        icon: <ContactMailIcon />,
      },
      {
        title: 'Total Covered Region',
        value: formatNumber(stats.total_covered_location),
        color: 'info',
        icon: <LocationOnIcon />,
      },
    ];
  }, [data]);

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Dashboard"
        breadcrumbs="Dashboard"
        subtitle="System Overview - Key statistics and metrics at a glance"
      />

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard statistics. Please try again later.
        </Alert>
      )}

      {/* Statistics Cards */}
      {!isLoading && !error && statsCards.length > 0 && (
        <StatisticsCards 
          cards={statsCards} 
          columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        />
      )}
    </Box>
  );
};

export default DashboardPage; 