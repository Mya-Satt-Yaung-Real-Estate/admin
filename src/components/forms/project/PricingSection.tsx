import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import { PROJECT_CURRENCIES } from '../../../validations/schemas/projectSchemas';

interface PricingSectionProps {
  values: Record<string, unknown>;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<unknown> | SelectChangeEvent<unknown>) => void;
  setFieldValue: (field: string, value: unknown) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
}) => {
  const currency = (values.currency as string) || 'MMK';
  const priceLabel = currency === 'MMK' ? 'Lakh' : currency;

  return (
    <FormSection title="Pricing">
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Currency</InputLabel>
            <Select
              name="currency"
              label="Currency"
              required
              value={currency}
              onChange={handleChange}
            >
              {PROJECT_CURRENCIES.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            required
            name="price_min"
            label={`Minimum Price (${priceLabel})`}
            type="number"
            inputProps={{ min: 0, step: 'any' }}
            value={values.price_min ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
              setFieldValue('price_min', value);
            }}
            error={touched.price_min && Boolean(errors.price_min)}
            helperText={touched.price_min && errors.price_min}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            required
            name="price_max"
            label={`Maximum Price (${priceLabel})`}
            type="number"
            inputProps={{ min: 0, step: 'any' }}
            value={values.price_max ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
              setFieldValue('price_max', value);
            }}
            error={touched.price_max && Boolean(errors.price_max)}
            helperText={touched.price_max && errors.price_max}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
