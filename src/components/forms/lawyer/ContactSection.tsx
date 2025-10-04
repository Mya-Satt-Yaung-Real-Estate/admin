import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
} from '@mui/material';
import { ContactPhone as PhoneIcon, Email as EmailIcon } from '@mui/icons-material';
import { LawyerFormData } from '../../../types/lawyer';

interface ContactSectionProps {
  values: LawyerFormData;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="600">
            Contact Information
          </Typography>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Phone and Email - Horizontal */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              name="phone"
              label="Phone Number"
              value={values.phone || ''}
              onChange={handleChange}
              error={touched.phone && Boolean(errors.phone)}
              helperText={touched.phone && errors.phone || (!values.email ? 'Required if email is not provided' : '')}
              placeholder="Enter phone number"
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              required={!values.email}
            />
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={values.email || ''}
              onChange={handleChange}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email || (!values.phone ? 'Required if phone is not provided' : '')}
              placeholder="Enter email address"
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              required={!values.phone}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
