import React, { useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import {
  Storage as StorageIcon,
  TableChart as DatabaseIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { useDashboardSystemInfo } from '../../services/queries';

const SystemMonitoringPage: React.FC = () => {
  const { 
    data: systemInfoData, 
    isLoading, 
    error 
  } = useDashboardSystemInfo();

  const systemInfoCards: StatCard[] = useMemo(() => {
    if (!systemInfoData?.data) return [];

    const info = systemInfoData.data;

    // Helper function to get color from alert status
    const getAlertColor = (alert?: { status: string }): 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      if (!alert) return 'info';
      switch (alert.status) {
        case 'critical': return 'error';
        case 'warning': return 'warning';
        case 'normal': return 'success';
        default: return 'info';
      }
    };

    const cards: StatCard[] = [
      {
        title: 'Disk Storage',
        value: `${info.disk.used} / ${info.disk.total}`,
        subtitle: info.disk.alert 
          ? `${info.disk.used_percentage}% used (Threshold: ${info.disk.alert.threshold}%)`
          : `${info.disk.used_percentage}% used`,
        color: getAlertColor(info.disk.alert),
        icon: <StorageIcon />,
      },
      {
        title: 'Database Size',
        value: info.database.size,
        subtitle: `${info.database.tables_count} tables`,
        color: 'info',
        icon: <DatabaseIcon />,
      },
      {
        title: 'PHP Memory',
        value: info.memory.php_memory_usage,
        subtitle: info.memory.alert
          ? `Limit: ${info.memory.php_memory_limit} (${info.memory.alert.current_usage_percent}% used)`
          : `Limit: ${info.memory.php_memory_limit}`,
        color: getAlertColor(info.memory.alert),
        icon: <MemoryIcon />,
      },
      {
        title: 'Server',
        value: `PHP ${info.server.php_version}`,
        subtitle: info.server.cpu_cores && info.server.total_ram
          ? `Laravel ${info.server.laravel_version} | ${info.server.cpu_cores} CPU Cores | ${info.server.total_ram} RAM`
          : `Laravel ${info.server.laravel_version}`,
        color: 'primary',
        icon: <ComputerIcon />,
      },
    ];

    // Add CPU info if available
    if (info.cpu.available) {
      if (info.cpu.alert) {
        const alert = info.cpu.alert;
        if (info.cpu.load_average_1min !== undefined && alert.current_load !== undefined) {
          const loadPercent = alert.cpu_cores > 0 
            ? Math.round((alert.current_load / alert.cpu_cores) * 100) 
            : 0;
          cards.push({
            title: 'CPU Load Average',
            value: `${alert.current_load}`,
            subtitle: `${alert.current_load} load / ${alert.cpu_cores} cores (${loadPercent}% used)`,
            color: getAlertColor(alert),
            icon: <SpeedIcon />,
          });
        } else if (info.cpu.cpu_usage_percent !== undefined && alert.current_usage !== undefined) {
          cards.push({
            title: 'CPU Usage',
            value: `${alert.current_usage}%`,
            subtitle: `Cores: ${alert.cpu_cores} | Threshold: ${alert.threshold}%`,
            color: getAlertColor(alert),
            icon: <SpeedIcon />,
          });
        }
      } else {
        // Fallback if alert is not available
        if (info.cpu.cpu_usage_percent !== undefined) {
          cards.push({
            title: 'CPU Usage',
            value: `${info.cpu.cpu_usage_percent}%`,
            color: info.cpu.cpu_usage_percent > 80 ? 'error' : info.cpu.cpu_usage_percent > 60 ? 'warning' : 'success',
            icon: <SpeedIcon />,
          });
        } else if (info.cpu.load_average_1min !== undefined && info.server.cpu_cores) {
          const loadPercent = info.server.cpu_cores > 0 
            ? Math.round((info.cpu.load_average_1min / info.server.cpu_cores) * 100) 
            : 0;
          cards.push({
            title: 'CPU Load Average',
            value: `${info.cpu.load_average_1min}`,
            subtitle: `${info.cpu.load_average_1min} load / ${info.server.cpu_cores} cores (${loadPercent}% used)`,
            color: info.cpu.load_average_1min > (info.server.cpu_cores * 2) ? 'error' : 
                   info.cpu.load_average_1min > info.server.cpu_cores ? 'warning' : 'success',
            icon: <SpeedIcon />,
          });
        }
      }
    }

    return cards;
  }, [systemInfoData]);

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="System Monitoring"
        breadcrumbs="Dashboard / Settings / System Monitoring"
        subtitle="Monitor server resources, performance, and system health"
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
          Failed to load system information. Please try again later.
        </Alert>
      )}

      {/* System Information Cards */}
      {!isLoading && !error && systemInfoCards.length > 0 && (
        <StatisticsCards 
          cards={systemInfoCards} 
          columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        />
      )}

      {/* Info about alerts */}
      {!isLoading && !error && systemInfoCards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Alert Status:</strong> Green indicates normal operation, Yellow indicates warning level, 
              and Red indicates critical levels that require attention.
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default SystemMonitoringPage;

