import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  Storage as StorageIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  ContactPhone as ContactIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  Handshake as HandshakeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState } from '../../components/ui';
import { ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { systemConfigurationAPI } from '../../services/api';
import { SystemConfiguration } from '../../types';

// Configuration categories with related icons
const CONFIG_CATEGORIES = {
  point_system: {
    name: 'Point System',
    description: 'Manage point system settings and costs',
    icon: <BusinessIcon />,
    color: '#1976d2',
  },
  trial_points: {
    name: 'Trial Points',
    description: 'Configure trial points for new users',
    icon: <MoneyIcon />,
    color: '#2e7d32',
  },
  property: {
    name: 'Property',
    description: 'Configure property-related settings',
    icon: <HomeIcon />,
    color: '#ed6c02',
  },
  advertisement: {
    name: 'Advertisement',
    description: 'Configure advertisement system settings and costs',
    icon: <BusinessIcon />,
    color: '#ff6b35',
  },
  wanted_list: {
    name: 'Wanted List',
    description: 'Configure wanted list settings and costs',
    icon: <AssignmentIcon />,
    color: '#0288d1',
  },
  share_profit_listing: {
    name: 'Share Profit Listing',
    description: 'Configure share profit listing expiration',
    icon: <HandshakeIcon />,
    color: '#6d4c41',
  },
  media: {
    name: 'Media',
    description: 'Manage media upload and processing settings',
    icon: <ImageIcon />,
    color: '#9c27b0',
  },
  cache: {
    name: 'Cache',
    description: 'Manage system cache settings',
    icon: <StorageIcon />,
    color: '#d32f2f',
  },
  validation: {
    name: 'Validation',
    description: 'Manage validation rules and limits',
    icon: <SecurityIcon />,
    color: '#7b1fa2',
  },
  payment_integration: {
    name: 'Payment Integration',
    description: 'Enable or disable online payment for point purchases',
    icon: <PaymentIcon />,
    color: '#00897b',
  },
  contact_information: {
    name: 'Contact Information',
    description: 'Manage company contact details and information',
    icon: <ContactIcon />,
    color: '#1976d2',
  },
} as const;

const SystemConfigurationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CONFIG_CATEGORIES>('point_system');
  const [showWarningDialog, setShowWarningDialog] = useState(true);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Fetch configurations for all categories
  const {
    data: configurationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system-configurations'],
    queryFn: async () => {
      const categories = Object.keys(CONFIG_CATEGORIES);
      const allConfigs: SystemConfiguration[] = [];
      
      for (const category of categories) {
        try {
          const response = await systemConfigurationAPI.getConfigurationsByCategory(category);
          if (response.data) {
            allConfigs.push(...response.data);
          }
        } catch (error) {
          console.error(`Failed to fetch ${category} configurations:`, error);
        }
      }
      
      return { data: allConfigs };
    },
  });

  // Update configuration mutation
  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => 
      systemConfigurationAPI.updateConfiguration(key, { config_value: value }),
    onSuccess: () => {
      showSuccess('Configuration updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['system-configurations'] });
    },
    onError: (error: any) => {
      showError(error?.message || 'Failed to update configuration');
    },
  });

  // Initialize form data when configurations are loaded
  useEffect(() => {
    if (configurationsData?.data) {
      const initialData: Record<string, any> = {};
      configurationsData.data.forEach((config: SystemConfiguration) => {
        initialData[config.config_key] = config.config_value;
      });
      setFormData(initialData);
    }
  }, [configurationsData]);

  // Get configurations for selected category
  const getConfigurationsForCategory = (category: string) => {
    const configurations = configurationsData?.data || [];
    return configurations.filter((config: SystemConfiguration) => config.category === category);
  };

  // Check if there are any changes in the current category
  const hasChangesInCurrentCategory = () => {
    if (!selectedCategory || !configurationsData?.data) return false;
    
    const categoryConfigs = getConfigurationsForCategory(selectedCategory);
    return categoryConfigs.some((config: SystemConfiguration) => {
      const originalValue = config.config_value;
      const currentValue = formData[config.config_key];
      return currentValue !== undefined && currentValue.toString() !== originalValue;
    });
  };

  // Handle form field changes
  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle save changes for current category
  const handleSaveChanges = () => {
    setShowSaveConfirmation(true);
  };

  // Handle actual save after confirmation
  const handleConfirmSave = async () => {
    try {
      const categoryConfigs = getConfigurationsForCategory(selectedCategory);
      const updatePromises = categoryConfigs.map((config: SystemConfiguration) => {
        const currentValue = formData[config.config_key];
        const originalValue = config.config_value;
        
        if (currentValue !== undefined && currentValue.toString() !== originalValue) {
          return updateMutation.mutateAsync({
            key: config.config_key,
            value: currentValue.toString(),
          });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises.filter(Boolean));
      setShowSaveConfirmation(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Handle reset to default for current category
  const handleResetToDefault = () => {
    if (configurationsData?.data) {
      const categoryConfigs = getConfigurationsForCategory(selectedCategory);
      const updatedFormData = { ...formData };
      
      categoryConfigs.forEach((config: SystemConfiguration) => {
        updatedFormData[config.config_key] = config.config_value;
      });
      
      setFormData(updatedFormData);
    }
  };

  // Render form field based on configuration type
  const renderFormField = (config: SystemConfiguration) => {
    const value = formData[config.config_key] || '';

    // Special handling for contact info source
    if (config.config_key === 'property.contact_info_source') {
      return (
        <FormControl fullWidth>
          <FormLabel component="legend">Contact Information Source</FormLabel>
          <RadioGroup
            value={value}
            onChange={(e) => handleFieldChange(config.config_key, e.target.value)}
            row
          >
            <FormControlLabel
              value="company"
              control={<Radio />}
              label="Company Information"
            />
            <FormControlLabel
              value="agent"
              control={<Radio />}
              label="Agent Information"
            />
          </RadioGroup>
        </FormControl>
      );
    }

    if (config.config_type === 'bool') {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={value === 'true'}
              onChange={(e) => handleFieldChange(config.config_key, e.target.checked.toString())}
              color="primary"
            />
          }
          label={value === 'true' ? 'Enabled' : 'Disabled'}
        />
      );
    }

    if (config.config_type === 'array') {
      return (
        <TextField
          fullWidth
          label="Value (JSON Array)"
          value={value}
          onChange={(e) => handleFieldChange(config.config_key, e.target.value)}
          variant="outlined"
          size="small"
          multiline
          rows={2}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Edit">
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      );
    }

    return (
      <TextField
        fullWidth
        label="Value"
        value={value}
        onChange={(e) => handleFieldChange(config.config_key, e.target.value)}
        variant="outlined"
        size="small"
        type={config.config_type === 'int' ? 'number' : 'text'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Edit">
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
    );
  };

  // Loading and error states
  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={refetch} />;

  const selectedCategoryConfig = CONFIG_CATEGORIES[selectedCategory];
  const categoryConfigurations = getConfigurationsForCategory(selectedCategory);

  return (
    <Box>
      <ActionAlert {...alert} onClose={clearAlert} />

      {/* Page Header */}
      <PageHeader
        title="System Configurations"
        subtitle="Manage all system configuration settings"
        actionButton={{
          text: 'Refresh',
          icon: <SettingsIcon />,
          onClick: () => refetch(),
        }}
      />

      {/* Main Content */}
      <Box sx={{ mt: 3, display: 'flex', gap: 3, minHeight: '600px' }}>
        {/* Sidebar */}
        <Paper sx={{ width: 280, flexShrink: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="600">
              Configuration Categories
            </Typography>
          </Box>
          <List sx={{ p: 0 }}>
            {Object.entries(CONFIG_CATEGORIES).map(([category, config]) => (
              <ListItem key={category} disablePadding>
                <ListItemButton
                  selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category as keyof typeof CONFIG_CATEGORIES)}
                  sx={{
                    minHeight: 48,
                    px: 2,
                    position: 'relative',
                    borderRadius: '0 8px 8px 0',
                    marginRight: 1,
                    marginLeft: 0,
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: 'transparent',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(59, 136, 128, 0.08)',
                      color: 'primary.main',
                      fontWeight: 600,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: 'primary.main',
                        borderRadius: '0 2px 2px 0',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                      '& .MuiListItemText-primary': {
                        fontWeight: 600,
                        color: 'primary.main',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(59, 136, 128, 0.12)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(59, 136, 128, 0.04)',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: 'inherit',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {config.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={config.name}
                    secondary={config.description}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: selectedCategory === category ? 600 : 400,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease-in-out',
                      },
                      '& .MuiListItemText-secondary': {
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      },
                    }}
                  />
                  <Chip 
                    label={getConfigurationsForCategory(category).length} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      minWidth: 24, 
                      height: 20, 
                      fontSize: '0.75rem',
                      backgroundColor: selectedCategory === category ? 'primary.light' : 'transparent'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Box sx={{ color: selectedCategoryConfig.color, mr: 2 }}>
                  {selectedCategoryConfig.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="600">
                    {selectedCategoryConfig.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCategoryConfig.description}
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={hasChangesInCurrentCategory() ? 'Modified' : 'Saved'} 
                color={hasChangesInCurrentCategory() ? 'warning' : 'success'} 
                size="small" 
              />
            </Box>

            {categoryConfigurations.length > 0 ? (
              <Grid container spacing={3}>
                {categoryConfigurations.map((config: SystemConfiguration) => (
                  <Grid item xs={12} md={6} key={config.config_key}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" component="h3" fontWeight="500">
                            {config.config_label}
                          </Typography>
                          {config.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {config.description}
                            </Typography>
                          )}
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {renderFormField(config)}

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Type: {config.config_type}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No configurations found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are no configurations available for this category.
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={updateMutation.isPending ? undefined : <SaveIcon />}
                onClick={handleSaveChanges}
                disabled={!hasChangesInCurrentCategory() || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetToDefault}
                disabled={!hasChangesInCurrentCategory()}
              >
                Reset to Default
              </Button>
            </Box>

            {/* Change Indicator */}
            {hasChangesInCurrentCategory() && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You have unsaved changes in this category. Please save or reset to continue.
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Warning Dialog */}
      <Dialog
        open={showWarningDialog}
        onClose={() => setShowWarningDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <WarningIcon sx={{ color: 'warning.main', fontSize: 28 }} />
          <Typography variant="h6" fontWeight="600">
            Important Notice
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
              ⚠️ System Configuration Access
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              You are about to access <strong>System Configuration settings</strong> that directly impact:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                <strong>Business Logic:</strong> <strong>Point system costs</strong>, <strong>trial allocations</strong>, and <strong>revenue calculations</strong>
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                <strong>System Performance:</strong> <strong>Cache settings</strong>, <strong>media processing</strong>, and <strong>upload limits</strong>
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                <strong>User Experience:</strong> <strong>Property upload costs</strong>, <strong>feature availability</strong>, and <strong>system behavior</strong>
              </Typography>
            </Box>
            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
              Please ensure you understand the <strong>implications</strong> of any changes before proceeding.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            variant="contained"
            onClick={() => setShowWarningDialog(false)}
            color="primary"
            size="medium"
            sx={{ 
              px: 2.5, 
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            I Understand, Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog
        open={showSaveConfirmation}
        onClose={() => setShowSaveConfirmation(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <WarningIcon sx={{ color: 'warning.main', fontSize: 28 }} />
          <Typography variant="h6" fontWeight="600">
            Confirm Configuration Changes
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
              ⚠️ System Configuration Update
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              You are about to save changes to <strong>{CONFIG_CATEGORIES[selectedCategory]?.name}</strong> configuration settings.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              These changes will <strong>immediately affect</strong>:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                <strong>System behavior</strong> and user experience
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                <strong>Business logic</strong> and calculations
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                <strong>Performance</strong> and system resources
              </Typography>
            </Box>
            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
              Are you sure you want to proceed with these changes?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setShowSaveConfirmation(false)}
            color="primary"
            size="medium"
            sx={{ 
              px: 2.5, 
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSave}
            color="primary"
            size="medium"
            disabled={updateMutation.isPending}
            sx={{ 
              px: 2.5, 
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Confirm & Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemConfigurationPage;
