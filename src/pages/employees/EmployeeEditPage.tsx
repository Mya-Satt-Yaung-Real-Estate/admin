import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useEmployee, useUpdateEmployee } from '../../services/queries/employees';
import { UpdateEmployeeData } from '../../types/employee';
import { employeeCreateSchema } from '../../validations';
import { EMPLOYEE_POSITIONS, EMPLOYEE_DEPARTMENTS, EMPLOYEE_STATUSES } from '../../constants/employees';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = employeeCreateSchema;

// ============================================================================
// COMPONENT
// ============================================================================

const EmployeeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();

  // Get employee data
  const { data: employee, isLoading, error } = useEmployee(id!);
  
  // Update Employee Mutation
  const updateEmployeeMutation = useUpdateEmployee();

  // Formik Form
  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      employee_id: employee?.data?.employee_id || '',
      name: employee?.data?.name || '',
      phone: employee?.data?.phone || '',
      email: employee?.data?.email || '',
      position: employee?.data?.position || '',
      department: employee?.data?.department || '',
      hire_date: employee?.data?.hire_date ? new Date(employee.data.hire_date) : null,
      status: employee?.data?.status || 'active',
      notes: employee?.data?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);
        
        // Prepare data for API
        const employeeData: UpdateEmployeeData = {
          employee_id: values.employee_id || null,
          name: values.name,
          phone: values.phone,
          email: values.email,
          position: values.position,
          department: values.department || null,
          hire_date: values.hire_date ? values.hire_date.toISOString().split('T')[0] : null,
          status: values.status,
          notes: values.notes || null,
        };

        console.log('Employee data to submit:', employeeData);
        await updateEmployeeMutation.mutateAsync({ id: id!, data: employeeData });
        
        // Navigate to employee list page with success message
        navigate(`/employees?success=${encodeURIComponent('Employee updated successfully!')}`);
      } catch (error: any) {
        console.error('Error updating employee:', error);
        showError(error.message || 'Failed to update employee. Please try again.');
      }
    },
  });

  // Check if all required fields are filled
  const isFormValid = formik.values.name && 
                     formik.values.phone && 
                     formik.values.email && 
                     formik.values.position && 
                     formik.values.status &&
                     !formik.errors.name &&
                     !formik.errors.phone &&
                     !formik.errors.email &&
                     !formik.errors.position &&
                     !formik.errors.status;

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading employee data...</Typography>
      </Box>
    );
  }

  // Error state
  if (error || !employee?.data) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Edit Employee"
          subtitle="Employee not found"
          breadcrumbs="Dashboard / Employees / Edit Employee"
        />
        <Box sx={{ mt: 2 }}>
          <Typography color="error">
            Employee not found or failed to load. Please try again.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <PageHeader
          title="Edit Employee"
          subtitle={`Update ${employee.data.name}'s information`}
          breadcrumbs="Dashboard / Employees / Edit Employee"
        />

        {/* Success/Error Alert */}
        <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

        {/* Update Error Alert */}
        {updateEmployeeMutation.isError && (
          <ActionAlert
            error={{
              show: true,
              message: updateEmployeeMutation.error?.message || 'Failed to update employee'
            }}
            sx={{ mb: 2 }}
            onClose={() => updateEmployeeMutation.reset()}
          />
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} lg={8}>
              {/* Basic Information */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Employee ID (Optional)"
                        name="employee_id"
                        value={formik.values.employee_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.employee_id && Boolean(formik.errors.employee_id)}
                        helperText={formik.touched.employee_id && formik.errors.employee_id}
                        placeholder="e.g., EMP-001"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label={
                          <span>
                            Name <span style={{ color: 'red' }}>*</span>
                          </span>
                        }
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label={
                          <span>
                            Phone <span style={{ color: 'red' }}>*</span>
                          </span>
                        }
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label={
                          <span>
                            Email <span style={{ color: 'red' }}>*</span>
                          </span>
                        }
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Job Information */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Job Information
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl 
                        fullWidth 
                        size="small"
                        error={formik.touched.position && Boolean(formik.errors.position)}
                      >
                        <InputLabel>
                          <span>
                            Position <span style={{ color: 'red' }}>*</span>
                          </span>
                        </InputLabel>
                        <Select
                          name="position"
                          value={formik.values.position}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label={
                            <span>
                              Position <span style={{ color: 'red' }}>*</span>
                            </span>
                          }
                        >
                          {EMPLOYEE_POSITIONS.map((position) => (
                            <MenuItem key={position.value} value={position.value}>
                              {position.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.position && formik.errors.position && (
                          <FormHelperText>{formik.errors.position}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl 
                        fullWidth 
                        size="small"
                        error={formik.touched.department && Boolean(formik.errors.department)}
                      >
                        <InputLabel>Department (Optional)</InputLabel>
                        <Select
                          name="department"
                          value={formik.values.department}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Department (Optional)"
                        >
                          <MenuItem value="">
                            <em>Select Department</em>
                          </MenuItem>
                          {EMPLOYEE_DEPARTMENTS.map((department) => (
                            <MenuItem key={department.value} value={department.value}>
                              {department.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.department && formik.errors.department && (
                          <FormHelperText>{formik.errors.department}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Hire Date (Optional)"
                        value={formik.values.hire_date}
                        onChange={(date) => formik.setFieldValue('hire_date', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: formik.touched.hire_date && Boolean(formik.errors.hire_date),
                            helperText: formik.touched.hire_date && formik.errors.hire_date,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl 
                        fullWidth 
                        size="small"
                        error={formik.touched.status && Boolean(formik.errors.status)}
                      >
                        <InputLabel>
                          <span>
                            Status <span style={{ color: 'red' }}>*</span>
                          </span>
                        </InputLabel>
                        <Select
                          name="status"
                          value={formik.values.status}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label={
                            <span>
                              Status <span style={{ color: 'red' }}>*</span>
                            </span>
                          }
                        >
                          {EMPLOYEE_STATUSES.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.status && formik.errors.status && (
                          <FormHelperText>{formik.errors.status}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                  <TextField
                    fullWidth
                    size="small"
                    label="Notes (Optional)"
                    name="notes"
                    multiline
                    rows={4}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                    helperText={formik.touched.notes && formik.errors.notes}
                    placeholder="Additional notes about the employee..."
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} lg={4}>
              {/* Form Actions */}
              <FormActions
                onSubmit={formik.handleSubmit}
                onCancel={() => navigate('/employees')}
                submitText="Update Employee"
                isSubmitting={updateEmployeeMutation.isPending}
                isDisabled={!isFormValid}
              />
            </Grid>
          </Grid>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default EmployeeEditPage;
