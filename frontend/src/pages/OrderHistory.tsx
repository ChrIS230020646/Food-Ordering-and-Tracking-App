import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  History as HistoryIcon,
  Restaurant as RestaurantIcon,
  CheckCircle as CheckCircleIcon
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
  deliveryLocation?: {
    lat: number;
    lng: number;
  };
  completedDate?: string;
  endDeliverTime?: string;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderHistory();
  }, []);

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
      completedDate: apiOrder.endDeliverTime,
      endDeliverTime: apiOrder.endDeliverTime,
    };
  };

  const loadOrderHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get order history from API (already filtered to delivered orders and sorted by created_time DESC - newest first)
      const apiOrders = await backendApi.getOrderHistory();
      console.log('Order History - Loaded orders from API:', apiOrders);
      console.log('Order History - Number of orders:', apiOrders.length);
      
      // Convert API orders to local format (maintain order from backend - newest first)
      const convertedOrders = apiOrders.map(convertApiOrderToLocal);
      setOrders(convertedOrders);
      console.log('Order History - Converted orders:', convertedOrders);
    } catch (error: any) {
      console.error('Error loading order history from API:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });

      let errorMessage = 'Failed to load order history';
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please ensure the backend is running and restarted.';
      } else if (error.message?.includes('Network Error') || !error.response) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:8080';
      } else if (error.response?.data?.message) {
        errorMessage = `${errorMessage}: ${error.response.data.message}`;
      } else if (error.response?.data) {
        errorMessage = `${errorMessage}: ${error.response.data}`;
      } else if (error.message) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }

      setError(errorMessage);
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

  const getRestaurantId = (orderId: string, restaurantName: string): string => {
    // Generate restaurant ID based on restaurant name
    // In a real app, this would come from the order data
    const restaurantIdMap: { [key: string]: string } = {
      'Italian Bistro': 'REST-001',
      'Burger House': 'REST-002',
      'Sushi Master': 'REST-003',
      'Thai Garden': 'REST-004'
    };
    return restaurantIdMap[restaurantName] || `REST-${orderId.substring(5, 8)}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon color="primary" />
        Order History
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
            No order history
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Your past orders will appear here
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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Restaurant ID: {getRestaurantId(order.id, order.restaurantName)}
                    </Typography>
                    {(order.completedDate || order.endDeliverTime) ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CheckCircleIcon fontSize="small" color="success" />
                        <Typography variant="body2" color="text.secondary">
                          Completed: {formatDate(order.completedDate || order.endDeliverTime || order.orderDate)}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CheckCircleIcon fontSize="small" color="success" />
                        <Typography variant="body2" color="text.secondary">
                          Completed: {formatDate(order.orderDate)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Chip
                    label="Delivered"
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Order Items */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Order Items
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
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OrderHistory;