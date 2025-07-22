import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  FormHelperText,
  Box,
} from '@mui/material';
import { Controller, Control, FieldError } from 'react-hook-form';
import { FormField as FormFieldType, SelectOption } from '../../types';

interface FormFieldProps {
  field: FormFieldType;
  control: Control<any>;
  error?: FieldError;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  control,
  error,
  disabled = false,
}) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                {...field}
                type={field.type}
                label={field.label}
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                fullWidth
                disabled={disabled}
                error={!!error}
                helperText={error?.message}
                required={field.required}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                {...field}
                label={field.label}
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                fullWidth
                multiline
                rows={4}
                disabled={disabled}
                error={!!error}
                helperText={error?.message}
                required={field.required}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <FormControl fullWidth error={!!error} disabled={disabled} required={field.required}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={value || ''}
                  onChange={onChange}
                  inputRef={ref}
                  label={field.label}
                >
                  {field.options?.map((option: SelectOption) => (
                    <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {error && <FormHelperText>{error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        );

      case 'switch':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={value || false}
                    onChange={onChange}
                    inputRef={ref}
                    disabled={disabled}
                  />
                }
                label={field.label}
              />
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {renderField()}
    </Box>
  );
};

export default FormField; 