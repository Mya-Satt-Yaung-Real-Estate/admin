import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Percent as PercentIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import {
  useCreateYarpyatTaxConfig,
  useDeleteYarpyatTaxConfig,
  useUpdateYarpyatTaxConfig,
  useYarpyatTaxConfigs,
} from '../../services/queries/locations';
import {
  CreateYarpyatTaxConfigData,
  YarpyatTaxConfig,
  YarpyatTaxConfigType,
} from '../../types/location';

const defaultFormData: CreateYarpyatTaxConfigData = {
  tax_type: 'selling',
  name_en: '',
  name_mm: '',
  percentage: 0,
  sort_order: 0,
  is_active: true,
};

const taxTypeLabels: Record<YarpyatTaxConfigType, string> = {
  selling: 'Selling Tax',
  buying: 'Buying Tax',
};

const YarpyatConfigPage: React.FC = () => {
  const { alert, showError, showSuccess, clearAlert } = useAlertSystem();
  const [search, setSearch] = useState('');
  const [taxTypeFilter, setTaxTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<YarpyatTaxConfig | null>(null);
  const [formData, setFormData] = useState<CreateYarpyatTaxConfigData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: configsData, isLoading, error } = useYarpyatTaxConfigs({
    search,
    tax_type: taxTypeFilter,
  });

  const createConfigMutation = useCreateYarpyatTaxConfig();
  const updateConfigMutation = useUpdateYarpyatTaxConfig();
  const deleteConfigMutation = useDeleteYarpyatTaxConfig();

  const configs = configsData?.data || [];

  const activeTotals = useMemo(() => {
    return configs.reduce(
      (totals, config) => {
        if (config.is_active) {
          totals[config.tax_type] += Number(config.percentage);
        }
        return totals;
      },
      { selling: 0, buying: 0 } as Record<YarpyatTaxConfigType, number>
    );
  }, [configs]);

  const filterFields: FilterField[] = [
    {
      key: 'taxTypeFilter',
      label: 'Tax Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        { value: 'selling', label: 'Selling Tax' },
        { value: 'buying', label: 'Buying Tax' },
      ],
    },
  ];

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingConfig(null);
    setErrors({});
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (config: YarpyatTaxConfig) => {
    setEditingConfig(config);
    setFormData({
      tax_type: config.tax_type,
      name_en: config.name_en,
      name_mm: config.name_mm,
      percentage: Number(config.percentage),
      sort_order: Number(config.sort_order),
      is_active: Boolean(config.is_active),
    });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof CreateYarpyatTaxConfigData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tax_type) {
      newErrors.tax_type = 'Tax type is required';
    }
    if (!formData.name_en.trim()) {
      newErrors.name_en = 'English name is required';
    }
    if (!formData.name_mm.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
    }
    if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = 'Percentage must be between 0 and 100';
    }
    if ((formData.sort_order ?? 0) < 0) {
      newErrors.sort_order = 'Sort order cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingConfig) {
        await updateConfigMutation.mutateAsync({
          slug: editingConfig.slug,
          data: formData,
        });
        showSuccess('Yarpyat tax config updated successfully.');
      } else {
        await createConfigMutation.mutateAsync(formData);
        showSuccess('Yarpyat tax config created successfully.');
      }
      closeDialog();
    } catch (error: any) {
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        showError(error?.message || 'Failed to save Yarpyat tax config.', true);
      }
    }
  };

  const handleDelete = (config: YarpyatTaxConfig) => {
    if (!window.confirm(`Are you sure you want to delete "${config.name_en}"?`)) {
      return;
    }

    deleteConfigMutation.mutate(config.slug, {
      onSuccess: () => showSuccess('Yarpyat tax config deleted successfully.'),
      onError: (error: any) => showError(error?.message || 'Failed to delete Yarpyat tax config.', true),
    });
  };

  const columns: TableColumn<YarpyatTaxConfig>[] = [
    {
      id: 'tax_type',
      label: 'Tax Type',
      render: (_, config) => (
        <Chip
          label={taxTypeLabels[config.tax_type]}
          color={config.tax_type === 'selling' ? 'success' : 'primary'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'name_en',
      label: 'Tax Name',
      render: (_, config) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {config.name_en}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {config.name_mm}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'percentage',
      label: 'Percentage',
      render: (_, config) => (
        <Typography variant="body2" fontWeight={700} color="success.main">
          {Number(config.percentage).toLocaleString()}%
        </Typography>
      ),
    },
    {
      id: 'sort_order',
      label: 'Sort',
      render: (_, config) => <Typography variant="body2">{config.sort_order}</Typography>,
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_, config) => (
        <Chip
          label={config.is_active ? 'Active' : 'Inactive'}
          color={config.is_active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, config) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" color="secondary" onClick={() => openEditDialog(config)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              disabled={deleteConfigMutation.isPending}
              onClick={() => handleDelete(config)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error.message || 'Failed to load Yarpyat config.'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Yarpyat Config"
        subtitle="Manage Selling Tax and Buying Tax breakdown percentages"
        breadcrumbs="Dashboard / Locations / Yarpyat Config"
        actionButton={{
          text: 'Add Tax Item',
          icon: <AddIcon />,
          onClick: openCreateDialog,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(['selling', 'buying'] as YarpyatTaxConfigType[]).map((type) => (
          <Grid item xs={12} md={6} key={type}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PercentIcon color={type === 'selling' ? 'success' : 'primary'} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active {taxTypeLabels[type]} Total
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {activeTotals[type].toLocaleString()}%
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <StandardFilters
        filters={{
          searchTerm: search,
          taxTypeFilter,
        }}
        fields={[
          {
            key: 'searchTerm',
            label: 'Search',
            type: 'search',
            placeholder: 'Search tax name...',
          },
          ...filterFields,
        ]}
        onFilterChange={(key, value) => {
          if (key === 'searchTerm') {
            setSearch(value);
          } else if (key === 'taxTypeFilter') {
            setTaxTypeFilter(value);
          }
        }}
        showClearButton
        onClearFilters={() => {
          setSearch('');
          setTaxTypeFilter('');
        }}
      />

      <StandardTable
        columns={columns}
        data={configs}
        page={0}
        rowsPerPage={Math.max(configs.length, 10)}
        totalCount={configs.length}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        loading={isLoading}
        emptyMessage="No Yarpyat tax config found"
        getRowKey={(row) => row.slug}
      />

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingConfig ? 'Edit Tax Item' : 'Add Tax Item'}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth error={!!errors.tax_type}>
                <InputLabel>Tax Type</InputLabel>
                <Select
                  label="Tax Type"
                  value={formData.tax_type}
                  onChange={(event) =>
                    handleInputChange('tax_type', event.target.value as YarpyatTaxConfigType)
                  }
                >
                  <MenuItem value="selling">Selling Tax</MenuItem>
                  <MenuItem value="buying">Buying Tax</MenuItem>
                </Select>
                {errors.tax_type && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.tax_type}
                  </Typography>
                )}
              </FormControl>

              <TextField
                label="English Name"
                value={formData.name_en}
                onChange={(event) => handleInputChange('name_en', event.target.value)}
                error={!!errors.name_en}
                helperText={errors.name_en}
                required
                fullWidth
              />

              <TextField
                label="Myanmar Name"
                value={formData.name_mm}
                onChange={(event) => handleInputChange('name_mm', event.target.value)}
                error={!!errors.name_mm}
                helperText={errors.name_mm}
                required
                fullWidth
              />

              <TextField
                label="Percentage"
                type="number"
                value={formData.percentage}
                onChange={(event) => handleInputChange('percentage', Number(event.target.value))}
                error={!!errors.percentage}
                helperText={errors.percentage || 'Example: 5 means 5%'}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                required
                fullWidth
              />

              <TextField
                label="Sort Order"
                type="number"
                value={formData.sort_order ?? 0}
                onChange={(event) => handleInputChange('sort_order', Number(event.target.value))}
                error={!!errors.sort_order}
                helperText={errors.sort_order}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(formData.is_active)}
                    onChange={(event) => handleInputChange('is_active', event.target.checked)}
                  />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createConfigMutation.isPending || updateConfigMutation.isPending}
            >
              {editingConfig ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default YarpyatConfigPage;
