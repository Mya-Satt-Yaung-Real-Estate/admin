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
import { ProjectUnitType } from '../../../types/project';

interface UnitTypesSectionProps {
  unitTypes: ProjectUnitType[];
  onChange: (unitTypes: ProjectUnitType[]) => void;
}

const emptyUnitType = (): ProjectUnitType => ({
  name: '',
  area: '',
  price_range: '',
  description: '',
  units: '',
});

export const UnitTypesSection: React.FC<UnitTypesSectionProps> = ({
  unitTypes,
  onChange,
}) => {
  const handleAdd = () => {
    onChange([...unitTypes, emptyUnitType()]);
  };

  const handleRemove = (index: number) => {
    onChange(unitTypes.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: keyof ProjectUnitType, value: string) => {
    const updated = unitTypes.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <FormSection title="Unit Types">
      {unitTypes.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No unit types added yet.
        </Typography>
      )}

      {unitTypes.map((unitType, index) => (
        <Card key={index} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2">Unit Type {index + 1}</Typography>
              <IconButton size="small" color="error" onClick={() => handleRemove(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  value={unitType.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Area"
                  value={unitType.area || ''}
                  onChange={(e) => handleFieldChange(index, 'area', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Price Range"
                  value={unitType.price_range || ''}
                  onChange={(e) => handleFieldChange(index, 'price_range', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Units"
                  value={unitType.units || ''}
                  onChange={(e) => handleFieldChange(index, 'units', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  multiline
                  rows={2}
                  value={unitType.description || ''}
                  onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
        Add Unit Type
      </Button>
    </FormSection>
  );
};
