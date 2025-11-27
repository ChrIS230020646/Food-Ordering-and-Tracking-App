import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const MyOrders: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartIcon color="primary" />
        My Orders
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No orders yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Your orders will appear here
        </Typography>
      </Paper>
    </Box>
  );
};

export default MyOrders;

