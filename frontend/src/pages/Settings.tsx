import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const Settings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon color="primary" />
        Settings
      </Typography>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Application Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Settings options will be displayed here
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings;

