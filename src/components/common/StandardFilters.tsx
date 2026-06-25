import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { FILTER_CONFIG } from '../../constants/filters';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  type: 'search' | 'select' | 'multiselect' | 'date' | 'autocomplete';
  label: string;
  options?: FilterOption[];
  placeholder?: string;
  width?: string | number | Record<string, string | number>;
  minWidth?: string | number | Record<string, string | number>;
  maxWidth?: string | number | Record<string, string | number>;
  flexGrow?: number;
  required?: boolean;
  loading?: boolean;
  noOptionsText?: string;
  onInputChange?: (value: string) => void;
}

export interface StandardFiltersProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  fields: FilterField[];
  searchPlaceholder?: string;
  searchHelperText?: string;
  onSearchKeyPress?: (event: React.KeyboardEvent) => void;
  onSearchClick?: () => void;
  showSearchButton?: boolean;
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

export function StandardFilters({
  filters,
  onFilterChange,
  fields,
  searchPlaceholder = FILTER_CONFIG.searchPlaceholder,
  searchHelperText,
  onSearchKeyPress,
  onSearchClick,
  showSearchButton = false,
  onClearFilters,
  showClearButton = false,
}: StandardFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange(key, value);
  };

  const renderField = (field: FilterField) => {
    const value = filters[field.key] || '';

    switch (field.type) {
      case 'search':
        return (
          <TextField
            key={field.key}
            placeholder={field.placeholder || searchPlaceholder}
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            onKeyPress={field.key === 'searchTerm' ? onSearchKeyPress : undefined}
            helperText={field.key === 'searchTerm' ? searchHelperText : undefined}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                </InputAdornment>
              ),
              endAdornment: field.key === 'searchTerm' && showSearchButton ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={onSearchClick}
                    edge="end"
                    size="small"
                    sx={{ mr: -1 }}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{
              minWidth: field.minWidth ?? { xs: 250, sm: 350 },
              maxWidth: field.maxWidth ?? { sm: 450 },
              flexGrow: field.flexGrow ?? (field.key === 'searchTerm' ? 1 : 0),
              width: field.width,
            }}
          />
        );

      case 'select':
        return (
          <FormControl
            key={field.key}
            sx={{
              minWidth: { xs: 200, sm: 150 },
              width: field.width,
            }}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'autocomplete': {
        const selectedOption = field.options?.find((option) => option.value === value) || null;

        return (
          <Autocomplete
            key={field.key}
            options={field.options || []}
            value={selectedOption}
            loading={field.loading}
            noOptionsText={field.noOptionsText || 'No options'}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, selected) => option.value === selected.value}
            onChange={(_, selected) => handleFilterChange(field.key, selected?.value || '')}
            onInputChange={(_, inputValue, reason) => {
              if (reason === 'input' || reason === 'clear') {
                field.onInputChange?.(inputValue);
              }
            }}
            sx={{
              minWidth: { xs: 250, sm: 260 },
              width: field.width,
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                placeholder={field.placeholder}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {field.loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        );
      }

      case 'date':
        return (
          <TextField
            key={field.key}
            type="date"
            label={field.label}
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              minWidth: { xs: 200, sm: 150 },
              width: field.width,
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        {fields.map(renderField)}
        
        {/* Clear Filters Button */}
        {showClearButton && onClearFilters && (
          <IconButton
            onClick={onClearFilters}
            color="error"
            sx={{
              height: 56, // Match TextField height
              width: 56,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main',
              },
            }}
            title="Clear all filters"
          >
            <RefreshIcon />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
} 