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
  Paper
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as DeliveryIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  Phone as PhoneIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Order } from './types/order';
import { getStatusColor, getStatusLabel, formatDate } from './utils/orderHelpers';

interface CustomerOrdersProps {
  orders: Order[];
  onContactCustomerService: (order: Order) => void;
  onContactDeliveryStaff: (order: Order) => void;
  onRateOrder?: (order: Order) => void;
  orderHasReview?: Map<number, boolean>;
}

const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  orders,
  onContactCustomerService,
  onContactDeliveryStaff,
  onRateOrder,
  orderHasReview = new Map()
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {orders.map((order) => (
        <Card key={order.id} sx={{ width: '100%' }}>
          <CardContent>
            {/* Order Header */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <DeliveryIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    Estimated Delivery: {(() => {
                      if (order.estimatedDeliveryTime) {
                        if (typeof order.estimatedDeliveryTime === 'string') {
                          return order.estimatedDeliveryTime;
                        } else {
                          return `${order.estimatedDeliveryTime.start} - ${order.estimatedDeliveryTime.end}`;
                        }
                      }
                      const orderDate = new Date(order.orderDate || order.createdTime || new Date());
                      const deliveryStart = new Date(orderDate.getTime() + 20 * 60 * 1000);
                      const deliveryEnd = new Date(orderDate.getTime() + 30 * 60 * 1000);
                      const formatTime = (date: Date) => {
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        return `${hours}:${minutes}`;
                      };
                      return `${formatTime(deliveryStart)} - ${formatTime(deliveryEnd)}`;
                    })()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <HomeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Delivery Address: {order.shippingAddress || 'Address not available'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
                {order.deliveryStaff && order.status !== 'pending' && order.deliverManId && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Staff
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.primary">
                        {order.deliveryStaff.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      ID: {order.deliveryStaff.id}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Order Details */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Order Details
            </Typography>
            <List dense>
              {order.items.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Box>
                        <Typography variant="body2">
                          {item.name} × {item.quantity}
                        </Typography>
                        {item.description && (
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < order.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ${order.totalPrice.toFixed(2)}
              </Typography>
            </Box>

            {/* Waiting for delivery staff */}
            {order.status === 'pending' && !order.deliveryStaff && (
              <>
                <Divider sx={{ my: 2 }} />
                <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <Typography variant="body2" align="center">
                    Waiting for a delivery staff to accept your order...
                  </Typography>
                </Paper>
              </>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SupportIcon />}
                onClick={() => onContactCustomerService(order)}
                color="error"
                sx={{ flex: 1, minWidth: '150px' }}
              >
                Contact Customer Service
              </Button>
              {order.deliveryStaff && order.status !== 'pending' && order.deliverManId && (
                <Button
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  onClick={() => onContactDeliveryStaff(order)}
                  color="primary"
                  sx={{ flex: 1, minWidth: '150px' }}
                >
                  Contact Delivery Staff
                </Button>
              )}
              {order.status === 'delivered' && onRateOrder && order.orderid && (
                <Button
                  variant="contained"
                  onClick={() => onRateOrder(order)}
                  color="primary"
                  sx={{ flex: 1, minWidth: '150px' }}
                >
                  {orderHasReview.get(order.orderid) ? 'View Rating' : 'Rate This Order'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default CustomerOrders;