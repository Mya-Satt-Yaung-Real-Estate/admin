import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Property } from '../../types/property';
import { Employee } from '../../types/employee';
import { employeesAPI } from '../../services/api/employees';

interface ReferralAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  property: Property | null;
  onSuccess: () => void;
  onAssignmentRemoved?: () => void;
}

interface PropertyEmployeeReferral {
  id: number;
  employee_id: number;
  assignment_type: 'referral' | 'handler';
  assignment_type_label: string;
  assigned_at: string;
  employee: Employee;
}

export const ReferralAssignmentModal: React.FC<ReferralAssignmentModalProps> = ({
  open,
  onClose,
  property,
  onSuccess,
  onAssignmentRemoved,
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [notes, setNotes] = useState('');
  const [currentAssignments, setCurrentAssignments] = useState<PropertyEmployeeReferral[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default values
  const assignmentType = 'referral';
  const referralSource = 'other';

  // Load employees and current assignments when modal opens
  useEffect(() => {
    if (open && property) {
      loadEmployees();
      loadCurrentAssignments();
    }
  }, [open, property]);

  // Clear selected employees when current assignments change
  useEffect(() => {
    if (currentAssignments.length > 0) {
      // Filter out any selected employees that are now assigned
      const assignedEmployeeIds = currentAssignments.map(assignment => assignment.employee_id);
      setSelectedEmployees(prev => 
        prev.filter(employee => !assignedEmployeeIds.includes(employee.id))
      );
    }
  }, [currentAssignments]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.list({ 
        status: 'active',
        per_page: 100 
      });
      setAvailableEmployees(response.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentAssignments = async () => {
    if (!property) return;
    
    try {
      const response = await employeesAPI.getPropertyReferrals(property.id);
      setCurrentAssignments((response.data as PropertyEmployeeReferral[]) || []);
    } catch (error) {
      console.error('Failed to load current assignments:', error);
    }
  };

  // Filter out already assigned employees
  const getAvailableEmployees = () => {
    if (currentAssignments.length === 0) {
      return availableEmployees;
    }
    
    const assignedEmployeeIds = currentAssignments.map(assignment => assignment.employee_id);
    return availableEmployees.filter(employee => !assignedEmployeeIds.includes(employee.id));
  };

  const handleSubmit = async () => {
    if (!property || selectedEmployees.length === 0) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await employeesAPI.bulkAssignToProperty({
        property_id: property.id,
        employee_ids: selectedEmployees.map(emp => emp.id),
        assignment_type: assignmentType,
        referral_source: referralSource,
        notes: notes,
      });

      const responseData = response.data as any;
      if (responseData?.successful_assignments > 0) {
        onSuccess();
        handleClose();
      }

      if (responseData?.failed_assignments > 0) {
        setError(`${responseData.failed_assignments} assignments failed`);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to assign employees');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      await employeesAPI.removeAssignment(assignmentId);
      loadCurrentAssignments(); // Refresh current assignments
      // Notify parent component to refresh employees list
      if (onAssignmentRemoved) {
        onAssignmentRemoved();
      }
      // The useEffect will automatically update available employees
    } catch (error) {
      console.error('Failed to remove assignment:', error);
    }
  };

  const handleClose = () => {
    setSelectedEmployees([]);
    setNotes('');
    setError(null);
    onClose();
  };

  if (!property) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6">
            Assign Referral Employee - {property.title_en}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Employee Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Employees
          </Typography>
          {getAvailableEmployees().length === 0 ? (
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                All available employees are already assigned to this property.
              </Typography>
            </Box>
          ) : (
            <Autocomplete
              multiple
              options={getAvailableEmployees()}
              getOptionLabel={(employee) => {
                const identifier = employee.employee_id || employee.email;
                return `${employee.name} (${identifier})`;
              }}
              value={selectedEmployees}
              onChange={(_, newValue) => setSelectedEmployees(newValue)}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Employees"
                  placeholder="Search employees by name, ID, or email..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, employee) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {employee.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {employee.employee_id ? `ID: ${employee.employee_id}` : `Email: ${employee.email}`}
                      {employee.position && ` • ${employee.position}`}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const identifier = option.employee_id || option.email;
                  return (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={`${option.name} (${identifier})`}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })
              }
            />
          )}
        </Box>

        {/* Notes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this assignment..."
          />
        </Box>

        {/* Current Assignments */}
        {currentAssignments.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Assignments
            </Typography>
            {currentAssignments.map((assignment) => {
              const identifier = assignment.employee.employee_id || assignment.employee.email;
              return (
                <Box
                  key={assignment.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {assignment.employee.name} ({identifier})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assignment.assignment_type_label} • {new Date(assignment.assigned_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveAssignment(assignment.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={selectedEmployees.length === 0 || submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : <PersonAddIcon />}
        >
          {submitting ? 'Assigning...' : 'Assign Employees'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
