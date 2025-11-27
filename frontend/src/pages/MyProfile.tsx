import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const MyProfile: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        My Profile
      </Typography>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Profile details will be displayed here
        </Typography>
      </Paper>
    </Box>
  );
};

export default MyProfile;

