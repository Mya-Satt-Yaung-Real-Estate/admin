import React from 'react';
import {
  Box,
  Typography,
  Switch,
  Autocomplete,
  TextField,
  Alert,
} from '@mui/material';
import { Business as BusinessIcon, Person as PersonIcon } from '@mui/icons-material';
import { FormSection } from '../shared/FormSection';
import { RegularUser } from '../../../types/user';

interface PropertyModeSectionProps {
  isPlatformProperty: boolean;
  onPlatformPropertyChange: (value: boolean) => void;
  userId?: number;
  onUserIdChange: (value: number | undefined) => void;
  users?: RegularUser[];
  usersLoading?: boolean;
  errors?: any;
  touched?: any;
  disabled?: boolean;
}

export const PropertyModeSection: React.FC<PropertyModeSectionProps> = ({
  isPlatformProperty,
  onPlatformPropertyChange,
  userId,
  onUserIdChange,
  users = [],
  usersLoading = false,
  errors = {},
  touched = {},
  disabled = false,
}) => {
  return (
    <FormSection title="Property Mode">
      {disabled ? (
        // Read-only display for edit mode
        <Box>
          {/* Property Mode Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {isPlatformProperty ? (
              <BusinessIcon color="primary" sx={{ fontSize: 20 }} />
            ) : (
              <PersonIcon color="primary" sx={{ fontSize: 20 }} />
            )}
            <Typography variant="body1" color="text.primary">
              {isPlatformProperty ? 'Platform Property' : 'User Property'}
            </Typography>
          </Box>

          {/* Property Owner Display (only for User Property) */}
          {!isPlatformProperty && userId && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Property Owner
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300',
                }}
              >
                {(() => {
                  const selectedUser = users.find(user => user.id === userId);
                  if (selectedUser) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        {selectedUser.name} ({selectedUser.email}) - {selectedUser.user_type || 'user'}
                      </Typography>
                    );
                  }
                  return (
                    <Typography variant="body2" color="text.secondary">
                      User not found
                    </Typography>
                  );
                })()}
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        // Interactive mode for create page
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            {/* Platform Property Option */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={isPlatformProperty}
                onChange={(e) => onPlatformPropertyChange(e.target.checked)}
                color="primary"
              />
              <BusinessIcon 
                color={isPlatformProperty ? 'primary' : 'action'} 
                sx={{ fontSize: 20 }} 
              />
              <Typography 
                variant="body1" 
                fontWeight={500}
                color={isPlatformProperty ? 'primary.main' : 'text.secondary'}
              >
                Platform Property
              </Typography>
            </Box>

            {/* User Property Option */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={!isPlatformProperty}
                onChange={(e) => onPlatformPropertyChange(!e.target.checked)}
                color="primary"
              />
              <PersonIcon 
                color={!isPlatformProperty ? 'primary' : 'action'} 
                sx={{ fontSize: 20 }} 
              />
              <Typography 
                variant="body1" 
                fontWeight={500}
                color={!isPlatformProperty ? 'primary.main' : 'text.secondary'}
              >
                User Property
              </Typography>
            </Box>
          </Box>

          {/* User Selection (only for User Property) */}
          {!isPlatformProperty && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Select User
              </Typography>
              <Autocomplete
                size="small"
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={users.find(user => user.id === userId) || null}
                onChange={(_, newValue) => onUserIdChange(newValue?.id)}
                loading={usersLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select User"
                    placeholder="Select User"
                    size="small"
                    error={touched.user_id && Boolean(errors.user_id)}
                    helperText={touched.user_id && errors.user_id}
                  />
                )}
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Creating a property on behalf of a user will deduct 10 points from their account when the property is published.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      )}
    </FormSection>
  );
};
