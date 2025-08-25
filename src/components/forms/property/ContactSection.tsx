import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FormSection } from '../shared/FormSection';

interface ContactSectionProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  phoneNumbers: string[];
  onPhoneNumberChange: (index: number, value: string) => void;
  onAddPhoneNumber: () => void;
  onRemovePhoneNumber: (index: number) => void;
  phoneNumbersTouched?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  phoneNumbers,
  onPhoneNumberChange,
  onAddPhoneNumber,
  onRemovePhoneNumber,
  phoneNumbersTouched = false,
}) => {
  return (
    <FormSection 
      title="Contact Information" 
      // subtitle="Provide contact details for the property"
    >
      <Grid container spacing={1.5}>
        {/* Owner Name */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            name="owner_name"
            label="Owner Name"
            value={values.owner_name}
            onChange={handleChange}
            error={touched.owner_name && Boolean(errors.owner_name)}
            helperText={touched.owner_name && errors.owner_name}
          />
        </Grid>

        {/* Phone Numbers */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Phone Numbers
          </Typography>
          {phoneNumbers.map((phone, index) => {
            // Check if this specific phone number is empty and should show error
            const isPhoneEmpty = phone.trim() === '';
            const shouldShowError = phoneNumbersTouched && isPhoneEmpty;
            const errorMessage = shouldShowError ? 'Phone number cannot be empty' : '';
            
            return (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={phone}
                  onChange={(e) => onPhoneNumberChange(index, e.target.value)}
                  placeholder="Phone number"
                  error={shouldShowError}
                  helperText={errorMessage}
                />
                {phoneNumbers.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => onRemovePhoneNumber(index)}
                    startIcon={<DeleteIcon />}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            );
          })}
          <Button
            variant="outlined"
            onClick={onAddPhoneNumber}
            startIcon={<AddIcon />}
          >
            Add Phone Number
          </Button>
        </Grid>

        {/* Email */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            name="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
