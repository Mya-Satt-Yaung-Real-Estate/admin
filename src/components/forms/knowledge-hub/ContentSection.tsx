import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
} from '@mui/material';

interface ContentSectionProps {
  values: {
    main_content: string;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Content
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <TextField
          fullWidth
          size="small"
          label={
            <span>
              Main Content <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
            </span>
          }
          name="main_content"
          value={values.main_content}
          onChange={handleChange}
          onBlur={handleBlur}
          multiline
          minRows={16}
          maxRows={40}
          error={touched.main_content && Boolean(errors.main_content)}
          helperText={touched.main_content && errors.main_content}
          sx={{
            '& .MuiInputBase-input': {
              resize: 'vertical',
            },
          }}
        />
      </CardContent>
    </Card>
  );
};
