import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

const OrderHistory: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon color="primary" />
        Order History
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No order history
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Your past orders will appear here
        </Typography>
      </Paper>
    </Box>
  );
};

export default OrderHistory;