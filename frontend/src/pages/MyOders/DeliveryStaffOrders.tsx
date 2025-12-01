import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  DirectionsBike as BikeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { Order } from './types/order';
import { formatDate, getStatusLabel, getStatusColor } from './utils/orderHelpers';

interface DeliveryStaffOrdersProps {
  orders: Order[];
  loadingProfile: boolean;
  profileError: string | null;
  currentDeliveryStaff: { id: string; name: string; phone: string } | null;
  onAcceptOrder: (order: Order) => void;
  onMarkAsDelivered: (order: Order) => void;
  onRetryProfile: () => void;
}

const DeliveryStaffOrders: React.FC<DeliveryStaffOrdersProps> = ({
  orders,
  loadingProfile,
  profileError,
  currentDeliveryStaff,
  onAcceptOrder,
  onMarkAsDelivered,
  onRetryProfile
}) => {
  
  
  const canAcceptOrder = !loadingProfile && currentDeliveryStaff && !profileError;
  
  
  const getDeliveryStaffName = () => {
    if (loadingProfile) return 'Loading...';
    if (profileError) return 'Unknown Staff';
    return currentDeliveryStaff?.name || 'Delivery Staff';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BikeIcon />
            <Box>
              <Typography variant="h6">
                {getDeliveryStaffName()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Delivery Staff
              </Typography>
            </Box>
            {profileError && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={onRetryProfile}
                sx={{ 
                  color: 'inherit', 
                  borderColor: 'inherit',
                  ml: 'auto'
                }}
              >
                Retry
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      
      {orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <BikeIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No Orders Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new delivery requests
            </Typography>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} sx={{ width: '100%' }}>
            <CardContent>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <RestaurantIcon color="primary" />
                    <Typography variant="h6">
                      {order.restaurantName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Order Date: {formatDate(order.orderDate)}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Box>

              
              {profileError && order.status === 'pending' && !order.deliveryStaff && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 2 }}
                  action={
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={onRetryProfile}
                    >
                      RETRY
                    </Button>
                  }
                >
                  Profile loading issue: {profileError}
                </Alert>
              )}

              
              {order.status === 'pending' && !order.deliveryStaff && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="contained"
                    startIcon={loadingProfile ? <CircularProgress size={20} color="inherit" /> : <BikeIcon />}
                    onClick={() => onAcceptOrder(order)}
                    fullWidth
                    color="primary"
                    size="large"
                    disabled={!canAcceptOrder}
                    sx={{
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {loadingProfile ? (
                      'Loading...'
                    ) : !currentDeliveryStaff ? (
                      'Profile Not Loaded'
                    ) : profileError ? (
                      'Profile Error - Click Retry'
                    ) : (
                      'Accept Delivery'
                    )}
                  </Button>
                  {!canAcceptOrder && !loadingProfile && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {profileError ? 'Fix profile error to accept orders' : 'Complete profile setup to accept orders'}
                    </Typography>
                  )}
                </>
              )}

              
              {order.status === 'delivering' && order.deliveryStaff?.id === currentDeliveryStaff?.id && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => onMarkAsDelivered(order)}
                    fullWidth
                    color="success"
                    size="large"
                  >
                    Mark as Delivered
                  </Button>
                </>
              )}

              
              {order.deliveryStaff && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Assigned to: {order.deliveryStaff.name}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default DeliveryStaffOrders;