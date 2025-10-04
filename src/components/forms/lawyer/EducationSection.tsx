import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CardMembership as CertificationIcon,
} from '@mui/icons-material';
import { LawyerFormData } from '../../../types/lawyer';

interface EducationSectionProps {
  values: LawyerFormData;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
}) => {
  const handleAddEducation = () => {
    const newEducation = [...(values.education || []), ''];
    setFieldValue('education', newEducation);
  };

  const handleEducationChange = (index: number, value: string) => {
    const newEducation = [...(values.education || [])];
    newEducation[index] = value;
    setFieldValue('education', newEducation);
  };

  const handleRemoveEducation = (index: number) => {
    const newEducation = (values.education || []).filter((_, i) => i !== index);
    setFieldValue('education', newEducation);
  };

  const handleAddCertification = () => {
    const newCertifications = [...(values.certifications || []), ''];
    setFieldValue('certifications', newCertifications);
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...(values.certifications || [])];
    newCertifications[index] = value;
    setFieldValue('certifications', newCertifications);
  };

  const handleRemoveCertification = (index: number) => {
    const newCertifications = (values.certifications || []).filter((_, i) => i !== index);
    setFieldValue('certifications', newCertifications);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="600">
            Education & Certifications
          </Typography>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Education */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Education
                <Typography component="span" sx={{ color: 'error.main' }}>*</Typography>
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddEducation}
                size="small"
                variant="outlined"
              >
                Add Education
              </Button>
            </Box>
            
            {(values.education || []).map((education, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  value={education}
                  onChange={(e) => handleEducationChange(index, e.target.value)}
                  placeholder="e.g., LLB from University of Yangon, 2015"
                  error={touched.education && Boolean(errors.education)}
                  helperText={index === 0 && touched.education && errors.education}
                />
                <IconButton
                  onClick={() => handleRemoveEducation(index)}
                  color="error"
                  size="small"
                  disabled={(values.education || []).length <= 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            {touched.education && errors.education && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.education}
              </Typography>
            )}
          </Box>

          {/* Certifications */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CertificationIcon sx={{ fontSize: 20 }} />
                Certifications
                <Typography component="span" sx={{ color: 'error.main' }}>*</Typography>
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddCertification}
                size="small"
                variant="outlined"
              >
                Add Certification
              </Button>
            </Box>
            
            {(values.certifications || []).map((certification, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  value={certification}
                  onChange={(e) => handleCertificationChange(index, e.target.value)}
                  placeholder="e.g., Certified Legal Professional, Bar Association Member"
                  error={touched.certifications && Boolean(errors.certifications)}
                  helperText={index === 0 && touched.certifications && errors.certifications}
                />
                <IconButton
                  onClick={() => handleRemoveCertification(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            {touched.certifications && errors.certifications && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.certifications}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EducationSection;
