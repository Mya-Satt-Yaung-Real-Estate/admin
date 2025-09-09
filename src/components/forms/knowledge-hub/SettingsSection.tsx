import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Autocomplete,
  TextField,
} from '@mui/material';

interface SettingsSectionProps {
  values: {
    news_article_category_id: number;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
  categories: any[];
  categoriesLoading?: boolean;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  categories,
  categoriesLoading = false,
}) => {
  // Suppress unused variable warning
  void handleBlur;
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Category Settings
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <Grid container spacing={3}>
          {/* Knowledge Hub Category */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              size="small"
              options={categories}
              getOptionLabel={(option) => option.name_en}
              value={categories.find(cat => cat.id === values.news_article_category_id) || null}
              onChange={(_, newValue) => {
                handleChange({
                  target: { name: 'news_article_category_id', value: newValue?.id || 0 }
                } as any);
              }}
              loading={categoriesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Knowledge Hub Category <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                    </span>
                  }
                  error={touched.news_article_category_id && Boolean(errors.news_article_category_id)}
                  helperText={touched.news_article_category_id && errors.news_article_category_id}
                />
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
