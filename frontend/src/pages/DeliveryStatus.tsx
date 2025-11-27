import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';

const DeliveryStatus: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeliveryDiningIcon color="primary" />
        Delivery Status
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No active deliveries
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Track your deliveries here
        </Typography>
      </Paper>
    </Box>
  );
};

export default DeliveryStatus;

