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

interface ProjectModeSectionProps {
  isPlatformProject: boolean;
  onPlatformProjectChange: (value: boolean) => void;
  userId?: number;
  onUserIdChange: (value: number | undefined) => void;
  users?: RegularUser[];
  usersLoading?: boolean;
  errors?: any;
  touched?: any;
  disabled?: boolean;
}

export const ProjectModeSection: React.FC<ProjectModeSectionProps> = ({
  isPlatformProject,
  onPlatformProjectChange,
  userId,
  onUserIdChange,
  users = [],
  usersLoading = false,
  errors = {},
  touched = {},
  disabled = false,
}) => {
  const developerUsers = users.filter(
    (user) => user.user_type === 'company' || user.user_type === 'individual'
  );

  return (
    <FormSection title="Project Mode">
      {disabled ? (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {isPlatformProject ? (
              <BusinessIcon color="primary" sx={{ fontSize: 20 }} />
            ) : (
              <PersonIcon color="primary" sx={{ fontSize: 20 }} />
            )}
            <Typography variant="body1" color="text.primary">
              {isPlatformProject ? 'Platform Project' : 'Developer Project'}
            </Typography>
          </Box>

          {!isPlatformProject && userId && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Developer
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
                  const selectedUser = developerUsers.find((user) => user.id === userId);
                  if (selectedUser) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        {selectedUser.name} ({selectedUser.email}) — {selectedUser.user_type}
                      </Typography>
                    );
                  }
                  return (
                    <Typography variant="body2" color="text.secondary">
                      Developer not found
                    </Typography>
                  );
                })()}
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={isPlatformProject}
                onChange={(e) => onPlatformProjectChange(e.target.checked)}
                color="primary"
              />
              <BusinessIcon
                color={isPlatformProject ? 'primary' : 'action'}
                sx={{ fontSize: 20 }}
              />
              <Typography
                variant="body1"
                fontWeight={500}
                color={isPlatformProject ? 'primary.main' : 'text.secondary'}
              >
                Platform Project
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={!isPlatformProject}
                onChange={(e) => onPlatformProjectChange(!e.target.checked)}
                color="primary"
              />
              <PersonIcon
                color={!isPlatformProject ? 'primary' : 'action'}
                sx={{ fontSize: 20 }}
              />
              <Typography
                variant="body1"
                fontWeight={500}
                color={!isPlatformProject ? 'primary.main' : 'text.secondary'}
              >
                Developer Project
              </Typography>
            </Box>
          </Box>

          {!isPlatformProject && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Select Developer
              </Typography>
              <Autocomplete
                size="small"
                options={developerUsers}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={developerUsers.find((user) => user.id === userId) || null}
                onChange={(_, newValue) => onUserIdChange(newValue?.id)}
                loading={usersLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Select Developer"
                    placeholder="Company or individual user"
                    error={touched.user_id && Boolean(errors.user_id)}
                    helperText={touched.user_id && errors.user_id}
                  />
                )}
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Assign the project to a company or individual developer account.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      )}
    </FormSection>
  );
};
