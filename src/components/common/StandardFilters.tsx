import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { FILTER_CONFIG } from '../../constants/filters';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  type: 'search' | 'select' | 'multiselect';
  label: string;
  options?: FilterOption[];
  placeholder?: string;
  width?: string | number;
  required?: boolean;
}

export interface StandardFiltersProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  fields: FilterField[];
  searchPlaceholder?: string;
}

export function StandardFilters({
  filters,
  onFilterChange,
  fields,
  searchPlaceholder = FILTER_CONFIG.searchPlaceholder,
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: 250, sm: 350 },
              maxWidth: { sm: 450 },
              flexGrow: field.key === 'searchTerm' ? 1 : 0,
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
      </Box>
    </Paper>
  );
} 