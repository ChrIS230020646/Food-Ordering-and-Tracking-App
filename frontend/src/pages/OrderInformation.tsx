import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const OrderInformation: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoIcon color="primary" />
        Order Information
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Order Information page content will be displayed here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default OrderInformation;

