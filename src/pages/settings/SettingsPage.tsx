import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Switch,
  Button,
  TextField,
  FormControlLabel,
} from '@mui/material';
import PageHeader from '../../components/layout/PageHeader';

const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Settings"
        breadcrumbs="Dashboard / Settings"
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Main Settings */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* General Settings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Site Name"
                defaultValue="Admin Panel"
                fullWidth
              />
              <TextField
                label="Site Description"
                defaultValue="Modern admin panel for managing users and data"
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Admin Email"
                defaultValue="admin@example.com"
                fullWidth
                type="email"
              />
            </Box>
          </Paper>

          {/* Notification Settings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email Notifications"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Push Notifications"
              />
              <FormControlLabel
                control={<Switch />}
                label="SMS Notifications"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Weekly Reports"
              />
            </Box>
          </Paper>

          {/* Security Settings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Two-Factor Authentication"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Session Timeout"
              />
              <FormControlLabel
                control={<Switch />}
                label="IP Whitelist"
              />
              <TextField
                label="Session Timeout (minutes)"
                defaultValue="30"
                type="number"
                fullWidth
              />
            </Box>
          </Paper>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="outlined" fullWidth>
                Export Data
              </Button>
              <Button variant="outlined" fullWidth>
                Backup Database
              </Button>
              <Button variant="outlined" fullWidth>
                Clear Cache
              </Button>
              <Button variant="outlined" fullWidth>
                System Health Check
              </Button>
            </Box>
          </Paper>

          {/* System Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Version" secondary="1.0.0" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Last Updated" secondary="2024-01-15" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Database Size" secondary="2.3 GB" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Active Users" secondary="1,234" />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large">
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage; 