import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  FormHelperText,
} from '@mui/material';

export interface EnhancedMultiSelectOption {
  id: number;
  name: string;
}

export interface EnhancedMultiSelectProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
  options: EnhancedMultiSelectOption[];
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

const EnhancedMultiSelect: React.FC<EnhancedMultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error = false,
  helperText,
  required = false,
  disabled = false,
}) => {
  const handleChange = (event: any) => {
    onChange(event.target.value as number[]);
  };

  const handleRemoveItem = (itemIdToRemove: number) => {
    const newValue = value.filter(id => id !== itemIdToRemove);
    onChange(newValue);
  };

  return (
    <FormControl fullWidth error={error} required={required} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        label={label}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as number[]).map((itemId) => {
              const option = options.find(opt => opt.id === itemId);
              return (
                <Box
                  key={itemId}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Chip 
                    label={option?.name || `Item ${itemId}`} 
                    size="small"
                    variant="filled"
                    onDelete={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleRemoveItem(itemId);
                    }}
                    sx={{
                      backgroundColor: '#3B8880', // Preferred teal color
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#2d6a64', // Darker teal on hover
                      },
                      '& .MuiChip-deleteIcon': {
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                      }
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      >
        {options.map((option) => {
          const isSelected = value.includes(option.id);
          return (
            <MenuItem 
              key={option.id} 
              value={option.id}
              sx={{
                backgroundColor: isSelected ? '#e8f4f3' : 'transparent', // Light teal background
                color: isSelected ? '#3B8880' : 'inherit', // Teal text
                fontWeight: isSelected ? 'bold' : 'normal',
                borderLeft: isSelected ? '4px solid #3B8880' : 'none', // Teal left border
                '&:hover': {
                  backgroundColor: isSelected ? '#3B8880' : '#f5f5f5', // Teal on hover
                  color: isSelected ? 'white' : 'inherit',
                },
                '&.Mui-selected': {
                  backgroundColor: '#e8f4f3',
                  color: '#3B8880',
                  fontWeight: 'bold',
                  borderLeft: '4px solid #3B8880',
                  '&:hover': {
                    backgroundColor: '#3B8880',
                    color: 'white',
                  }
                }
              }}
            >
              {option.name}
            </MenuItem>
          );
        })}
      </Select>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default EnhancedMultiSelect;
