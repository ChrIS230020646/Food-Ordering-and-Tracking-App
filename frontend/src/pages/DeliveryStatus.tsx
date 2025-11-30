import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  DeliveryDining as DeliveryDiningIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { backendApi, Order as ApiOrder } from '../services/api';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  restaurant?: string;
}

interface Order {
  id: string;
  orderid?: number;
  restaurantName: string;
  items: CartItem[];
  totalPrice: number;
  totalAmount?: number;
  paymentMethod: string;
  orderDate: string;
  createdTime?: string;
  status: string;
  estimatedDeliveryTime?: {
    start: string;
    end: string;
  } | string;
  deliveryStaff?: {
    id: string;
    name: string;
    phone: string;
  };
  deliverManId?: number;
  deliveryStaffName?: string;
  deliveryStaffPhone?: string;
  deliveryLocation?: {
    lat: number;
    lng: number;
  };
  completedDate?: string;
  endDeliverTime?: string;
}

// Helper function to get user role
const getUserRole = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role) {
          return payload.role;
        }
      } catch (e) {
        console.warn('Failed to decode token:', e);
      }
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) return user.role;
        if (user.userType) return user.userType;
      } catch (e) {
        console.warn('Failed to parse user:', e);
      }
    }
  } catch (error) {
    console.error('Error getting user role:', error);
  }
  return null;
};


const DeliveryStatus: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (userRole !== null) {
      loadOrders();
    }
  }, [userRole]);

  // Refresh orders periodically (every 30 seconds)
  useEffect(() => {
    if (userRole === 'delivery') {
      const interval = setInterval(() => {
        loadOrders();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userRole]);

  // Convert API Order format to local Order format
  const convertApiOrderToLocal = (apiOrder: ApiOrder): Order => {
    return {
      id: `ORDER-${apiOrder.orderid}`,
      orderid: apiOrder.orderid,
      restaurantName: apiOrder.restaurantName || 'Unknown Restaurant',
      items: (apiOrder.items || []).map(item => ({
        id: item.itemId,
        itemId: item.itemId,
        name: item.itemName,
        itemName: item.itemName,
        description: item.description || '',
        price: Number(item.price),
        quantity: item.quantity,
      })),
      totalPrice: Number(apiOrder.totalAmount || 0),
      totalAmount: Number(apiOrder.totalAmount || 0),
      paymentMethod: apiOrder.paymentMethod || 'cash',
      orderDate: apiOrder.createdTime || new Date().toISOString(),
      createdTime: apiOrder.createdTime,
      status: apiOrder.status,
      estimatedDeliveryTime: apiOrder.estimatedDeliveryTime || undefined,
      deliveryStaff: apiOrder.deliverManId ? {
        id: String(apiOrder.deliverManId),
        name: apiOrder.deliveryStaffName || 'Delivery Staff',
        phone: apiOrder.deliveryStaffPhone || ''
      } : undefined,
      deliverManId: apiOrder.deliverManId,
      deliveryStaffName: apiOrder.deliveryStaffName,
      deliveryStaffPhone: apiOrder.deliveryStaffPhone,
      completedDate: apiOrder.endDeliverTime,
      endDeliverTime: apiOrder.endDeliverTime,
    };
  };

  const loadOrders = async () => {
    const currentRole = userRole || getUserRole();
    
    if (currentRole !== 'delivery') {
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // For delivery staff: get their assigned orders (accepted orders)
      const apiOrders = await backendApi.getDeliveryStaffOrders();
      console.log('Delivery Status - Loaded orders:', apiOrders);
      
      // Filter out pending orders - only show accepted/delivering/delivered orders
      // Also show orders with status 'out_for_delivery' (legacy) or 'delivering'
      const acceptedOrders = apiOrders.filter(apiOrder => 
        apiOrder.status !== 'pending' && apiOrder.deliverManId != null
      );
      
      const convertedOrders = acceptedOrders.map(convertApiOrderToLocal);
      setOrders(convertedOrders);
      console.log('Delivery Status - Converted orders:', convertedOrders);
    } catch (error: any) {
      console.error('Error loading delivery staff orders from API:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'info';
      case 'preparing':
        return 'info';
      case 'ready':
        return 'primary';
      case 'delivering':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'delivering':
        return 'Delivering';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const markOrderAsDelivered = async (order: Order) => {
    if (!order.orderid) {
      alert('Invalid order. Cannot mark as delivered.');
      return;
    }

    try {
      // Call API to update order status
      await backendApi.updateOrderStatus(order.orderid, 'delivered');
      
      // Reload orders to get updated data
      await loadOrders();
      
      alert('Order marked as delivered successfully!');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(`Failed to update order status: ${error.response?.data || error.message}`);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!order.orderid) {
      alert('Invalid order. Cannot cancel.');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      // Call API to cancel order
      await backendApi.cancelOrder(order.orderid);
      
      // Reload orders to get updated data
      await loadOrders();
      
      alert('Order cancelled successfully!');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.response?.data || error.message}`);
    }
  };

  const handleContactCustomer = (order: Order) => {
    // TODO: Implement customer contact functionality (e.g., open chat dialog)
    // For now, show customer info
    if (order.deliveryStaff) {
      alert(`Contact customer functionality will be implemented here.\nOrder ID: ${order.orderid}`);
    } else {
      alert('Customer information not available.');
    }
  };

  const handleContactCustomerService = (order: Order) => {
    // TODO: Implement customer service contact functionality (e.g., open chat dialog)
    alert(`Contact customer service functionality will be implemented here.\nOrder ID: ${order.orderid}`);
  };

  // Only show this page for delivery staff
  const currentRole = userRole || getUserRole();
  if (currentRole !== 'delivery') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          This page is only available for delivery staff.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeliveryDiningIcon color="primary" />
        Delivery Status
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No active deliveries
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Accepted orders will appear here
          </Typography>
        </Paper>
      ) : (
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
                            }
                            return `${order.estimatedDeliveryTime.start} - ${order.estimatedDeliveryTime.end}`;
                          }
                          const orderDate = new Date(order.orderDate);
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
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Order Details */}
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

                {/* Total Price */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Total
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${order.totalPrice.toFixed(2)}
                  </Typography>
                </Box>

                {/* Delivery Tracking Map (automatically shown when delivering) */}
                {order.status === 'delivering' && order.deliveryLocation && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 300, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: 1,
                        borderColor: 'divider'
                      }}>
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${order.deliveryLocation.lat},${order.deliveryLocation.lng}&hl=en&z=15&output=embed`}
                        />
                      </Box>
                    </Box>
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Action Buttons - Show for delivering orders */}
                {order.status === 'delivering' && (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => handleCancelOrder(order)}
                      color="error"
                      sx={{ flex: 1, minWidth: '150px' }}
                    >
                      Cancel Order
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PhoneIcon />}
                      onClick={() => handleContactCustomer(order)}
                      color="primary"
                      sx={{ flex: 1, minWidth: '150px' }}
                    >
                      Contact Customer
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SupportIcon />}
                      onClick={() => handleContactCustomerService(order)}
                      color="info"
                      sx={{ flex: 1, minWidth: '150px' }}
                    >
                      Contact Customer Service
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => markOrderAsDelivered(order)}
                      color="success"
                      sx={{ flex: 1, minWidth: '150px' }}
                    >
                      Mark as Delivered
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DeliveryStatus;

