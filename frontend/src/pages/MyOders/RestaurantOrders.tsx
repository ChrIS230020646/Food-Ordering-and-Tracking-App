import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Avatar,
  Tooltip,
  IconButton,
  Alert,
  LinearProgress,
  CardHeader,
  Stack
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  LocalShipping as DeliveryIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Fastfood as FastfoodIcon
} from '@mui/icons-material';
import { Order } from './types/order';
import { formatDate, getStatusColor, getStatusLabel } from './utils/orderHelpers';

interface RestaurantOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (order: Order, newStatus: string) => void;
}

const RestaurantOrders: React.FC<RestaurantOrdersProps> = ({
  orders,
  onUpdateOrderStatus
}) => {
  // 餐廳端不再顯示任意狀態選單，只保留「確認訂單 / 取消訂單」按鈕

  
  const getOrderProgress = (status: string) => {
    const statusSteps = ['pending', 'preparing', 'ready', 'delivering', 'delivered'];
    const currentStep = statusSteps.indexOf(status);
    return currentStep >= 0 ? (currentStep / (statusSteps.length - 1)) * 100 : 0;
  };

  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon color="warning" />;
      case 'preparing':
        return <FastfoodIcon color="info" />;
      case 'ready':
        return <CheckCircleIcon color="primary" />;
      case 'delivering':
        return <DeliveryIcon color="secondary" />;
      case 'delivered':
        return <CheckCircleIcon color="success" />;
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <ScheduleIcon />;
    }
  };

  
  const orderStats = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    preparing: orders.filter(order => order.status === 'preparing').length,
    ready: orders.filter(order => order.status === 'ready').length,
    delivering: orders.filter(order => order.status === 'delivering').length,
  };

  return (
    <>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ textAlign: 'center', bgcolor: 'background.default', flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
          <CardContent>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {orderStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Orders
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
          <CardContent>
            <Typography variant="h4" color="warning.dark" fontWeight="bold">
              {orderStats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'info.light', flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
          <CardContent>
            <Typography variant="h4" color="info.dark" fontWeight="bold">
              {orderStats.preparing}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preparing
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
          <CardContent>
            <Typography variant="h4" color="primary.dark" fontWeight="bold">
              {orderStats.ready}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ready
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'secondary.light', flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
          <CardContent>
            <Typography variant="h4" color="secondary.dark" fontWeight="bold">
              {orderStats.delivering}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Delivering
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {orders.map((order) => (
          <Card 
            key={order.id} 
            sx={{ 
              width: '100%',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <RestaurantIcon />
                </Avatar>
              }
              action={
                <Chip
                  icon={getStatusIcon(order.status)}
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status)}
                  variant="filled"
                />
              }
              title={
                <Typography variant="h6" component="div">
                  Order #{order.orderid}
                </Typography>
              }
              subheader={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.orderDate)}
                  </Typography>
                </Box>
              }
            />

            <CardContent>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Order Progress
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {Math.round(getOrderProgress(order.status))}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={getOrderProgress(order.status)}
                  color={
                    order.status === 'delivered' ? 'success' :
                    order.status === 'cancelled' ? 'error' : 'primary'
                  }
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FastfoodIcon color="primary" />
                    Order Items
                  </Typography>
                  <List dense sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                    {order.items.map((item, index) => (
                      <React.Fragment key={item.id || index}>
                        <ListItem sx={{ px: 2, py: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {item.name}
                              </Typography>
                              {item.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  {item.description}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Qty: {item.quantity}
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold" color="primary">
                              ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        </ListItem>
                        {index < order.items.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 2, bgcolor: 'primary.main', borderRadius: 1 }}>
                    <Typography variant="h6" color="white">
                      Total Amount (After 10% Delivery Fee)
                    </Typography>
                    <Typography variant="h5" color="white" fontWeight="bold">
                      ${(order.totalPrice * 0.9).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PaymentIcon color="primary" />
                          Payment Information
                        </Typography>
                        <Chip 
                          label={order.paymentMethod ? order.paymentMethod.replace('_', ' ').toUpperCase() : 'CASH'} 
                          color="secondary" 
                          variant="outlined"
                        />
                      </CardContent>
                    </Card>

                    
                    {order.deliveryStaff && (
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DeliveryIcon color="primary" />
                            Delivery Information
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {order.deliveryStaff.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {order.deliveryStaff.phone}
                                </Typography>
                              </Box>
                            </Box>
                            <Tooltip title="Call Delivery Staff">
                              <IconButton 
                                color="primary"
                                onClick={() => window.open(`tel:${order.deliveryStaff?.phone}`)}
                              >
                                <PhoneIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    )}

                    
                    {order.estimatedDeliveryTime && (
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon color="primary" />
                            Estimated Delivery
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {typeof order.estimatedDeliveryTime === 'string'
                              ? order.estimatedDeliveryTime
                              : `${order.estimatedDeliveryTime.start} - ${order.estimatedDeliveryTime.end}`}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                </Box>
              </Box>

              
              <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                {/* 餐廳確認訂單：pending -> preparing */}
                {order.status === 'pending' && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => onUpdateOrderStatus(order, 'preparing')}
                    color="primary"
                    size="small"
                  >
                    Confirm Order
                  </Button>
                )}

                {/* 餐廳取消訂單：pending 或 preparing -> cancelled */}
                {(order.status === 'pending' || order.status === 'preparing') && (
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => onUpdateOrderStatus(order, 'cancelled')}
                    color="error"
                    size="small"
                  >
                    Cancel Order
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

    </>
  );
};

export default RestaurantOrders;