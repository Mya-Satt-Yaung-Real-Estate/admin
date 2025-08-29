import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  IconButton,
  Box,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

interface ContactSectionProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  phoneNumbers: string[];
  onPhoneNumberChange: (index: number, value: string) => void;
  onAddPhoneNumber: () => void;
  onRemovePhoneNumber: (index: number) => void;
  phoneNumbersTouched: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  phoneNumbers,
  onPhoneNumberChange,
  onAddPhoneNumber,
  onRemovePhoneNumber,
  phoneNumbersTouched,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <Grid container spacing={2}>
          {/* Contact Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              name="contact_name"
              label="Contact Name *"
              value={values.contact_name}
              onChange={handleChange}
              error={touched.contact_name && Boolean(errors.contact_name)}
              helperText={touched.contact_name && errors.contact_name}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              type="email"
              name="email"
              label="Email *"
              value={values.email}
              onChange={handleChange}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />
          </Grid>

          {/* Phone Numbers */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Phone Numbers *
            </Typography>
            {phoneNumbers.map((phone, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={phone}
                  onChange={(e) => onPhoneNumberChange(index, e.target.value)}
                  placeholder="Enter phone number"
                  error={phoneNumbersTouched && Boolean(errors.phone_numbers?.[index])}
                  helperText={phoneNumbersTouched && errors.phone_numbers?.[index]}
                />
                {phoneNumbers.length > 1 && (
                  <IconButton
                    onClick={() => onRemovePhoneNumber(index)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <IconButton
              onClick={onAddPhoneNumber}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            >
              <AddIcon />
            </IconButton>
            <Typography variant="caption" color="textSecondary">
              Add another phone number
            </Typography>
            {phoneNumbersTouched && errors.phone_numbers && (
              <FormHelperText error>{errors.phone_numbers}</FormHelperText>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
