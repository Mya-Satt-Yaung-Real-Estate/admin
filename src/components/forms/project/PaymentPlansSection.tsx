import React from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FormSection } from '../shared/FormSection';
import { ProjectPaymentPlan } from '../../../types/project';

interface PaymentPlansSectionProps {
  paymentPlans: ProjectPaymentPlan[];
  onChange: (paymentPlans: ProjectPaymentPlan[]) => void;
}

const emptyPaymentPlan = (): ProjectPaymentPlan => ({
  name: '',
  description: '',
});

export const PaymentPlansSection: React.FC<PaymentPlansSectionProps> = ({
  paymentPlans,
  onChange,
}) => {
  const handleAdd = () => {
    onChange([...paymentPlans, emptyPaymentPlan()]);
  };

  const handleRemove = (index: number) => {
    onChange(paymentPlans.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: keyof ProjectPaymentPlan, value: string) => {
    const updated = paymentPlans.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <FormSection title="Payment Plans">
      {paymentPlans.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No payment plans added yet.
        </Typography>
      )}

      {paymentPlans.map((plan, index) => (
        <Card key={index} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2">Payment Plan {index + 1}</Typography>
              <IconButton size="small" color="error" onClick={() => handleRemove(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Plan Name"
                  value={plan.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  multiline
                  rows={2}
                  value={plan.description || ''}
                  onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
        Add Payment Plan
      </Button>
    </FormSection>
  );
};
