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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Alert,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as DeliveryIcon,
  Phone as PhoneIcon,
  Support as SupportIcon,
  Send as SendIcon,
  Person as PersonIcon,
  DirectionsBike as BikeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { backendApi } from '../services/api';

// Import Order type from api.ts
import { Order as ApiOrder } from '../services/api';

// Local Order interface for compatibility
interface Order {
  id: string;
  orderid?: number;
  restaurantName: string;
  items: Array<{
    id?: number;
    itemId?: number;
    name: string;
    itemName?: string;
    description: string;
    price: number;
    quantity: number;
    restaurant?: string;
  }>;
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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'staff';
  timestamp: Date;
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

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chatType, setChatType] = useState<'customer_service' | 'delivery_staff'>('customer_service');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentDeliveryStaff, setCurrentDeliveryStaff] = useState<{
    id: string;
    name: string;
    phone: string;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    
    // Load delivery staff profile from API if user is delivery staff
    if (role === 'delivery') {
      // Wait a bit to ensure token is saved after login
      const timer = setTimeout(() => {
        loadDeliveryStaffProfile();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const loadDeliveryStaffProfile = async (retryCount = 0): Promise<{ id: string; name: string; phone: string } | null> => {
    // Check if token exists before making API call
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, waiting...');
      if (retryCount < 3) {
        // Retry after 1 second
        return new Promise((resolve) => {
          setTimeout(async () => {
            const result = await loadDeliveryStaffProfile(retryCount + 1);
            resolve(result);
          }, 1000);
        });
      } else {
        setProfileError('Please log in again. Token not found.');
        setLoadingProfile(false);
        return null;
      }
    }

    setLoadingProfile(true);
    setProfileError(null);
    
    try {
      console.log('Attempting to load delivery staff profile from API...');
      const profile = await backendApi.getDeliveryStaffProfile();
      console.log('Successfully loaded profile:', profile);
      const staffInfo = {
        id: String(profile.staffId),
        name: profile.name,
        phone: profile.phone || ''
      };
      setCurrentDeliveryStaff(staffInfo);
      setProfileError(null);
      return staffInfo;
    } catch (error: any) {
      console.error('Error loading delivery staff profile from API:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Check error type and provide specific messages
      if (error.response?.status === 401) {
        setProfileError('Session expired. Please log in again.');
      } else if (error.response?.status === 404) {
        setProfileError('API endpoint not found. Please restart the backend server.');
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setProfileError('Connection timeout. Please check your network and try again.');
      } else if (error.message?.includes('Network Error') || !error.response) {
        setProfileError('Cannot connect to server. Please ensure the backend is running on http://localhost:8080');
      } else {
        setProfileError(`Failed to load profile (${error.response?.status || 'Unknown error'}). Please refresh the page.`);
      }
      
      setCurrentDeliveryStaff(null);
      
      // Retry once after 2 seconds if it's not a 401 error
      if (retryCount === 0 && error.response?.status !== 401) {
        return new Promise((resolve) => {
          setTimeout(async () => {
            const result = await loadDeliveryStaffProfile(1);
            resolve(result);
          }, 2000);
        });
      }
      
      return null;
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (userRole !== null) {
      loadOrders();
    }
  }, [userRole]);

  // Refresh orders periodically (every 30 seconds)
  useEffect(() => {
    if (userRole !== null) {
      const interval = setInterval(() => {
        loadOrders();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userRole]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  const loadOrders = async () => {
    try {
      const currentRole = userRole || getUserRole();
      
      if (currentRole === 'delivery') {
        // For delivery staff: get pending orders (only orders that haven't been accepted)
        const pendingOrders = await backendApi.getPendingOrders();
        console.log('MyOrders - Loaded pending orders:', pendingOrders);
        
        // Filter to only show truly pending orders (not accepted by anyone)
        const unacceptedOrders = pendingOrders.filter(order => 
          order.status === 'pending' && !order.deliverManId
        );
        
        // Convert API orders to local format
        const convertedOrders = unacceptedOrders.map(convertApiOrderToLocal);
        setOrders(convertedOrders);
        console.log('MyOrders - Converted orders:', convertedOrders);
      } else if (currentRole === 'customer') {
        // For customers: get their orders from API (already sorted by created_time DESC - newest first)
        const apiOrders = await backendApi.getCustomerOrders();
        console.log('MyOrders - Loaded customer orders from API:', apiOrders);
        console.log('MyOrders - Number of orders:', apiOrders.length);
        
        // Convert API orders to local format (maintain order from backend - newest first)
        const convertedOrders = apiOrders.map(convertApiOrderToLocal);
        console.log('MyOrders - Converted orders:', convertedOrders);
        setOrders(convertedOrders);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error loading orders from API:', error);
      // Fallback to empty array if API fails
      setOrders([]);
    }
  };

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
      totalPrice: apiOrder.totalAmount ? Number(apiOrder.totalAmount) : (() => {
        // Calculate from items if totalAmount is missing
        const itemsTotal = (apiOrder.items || []).reduce((sum, item) => {
          return sum + (Number(item.price) * item.quantity);
        }, 0);
        return itemsTotal;
      })(),
      totalAmount: apiOrder.totalAmount ? Number(apiOrder.totalAmount) : (() => {
        // Calculate from items if totalAmount is missing
        const itemsTotal = (apiOrder.items || []).reduce((sum, item) => {
          return sum + (Number(item.price) * item.quantity);
        }, 0);
        return itemsTotal;
      })(),
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

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'info';
      case 'preparing':
        return 'info';
      case 'delivering':
        return 'primary';
      case 'ready':
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
      case 'delivering':
        return 'Delivering';
      case 'ready':
        return 'Ready';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
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

  const handleRequestRefund = (order: Order) => {
    setSelectedOrder(order);
    setChatType('customer_service');
    setMessages([]);
    setNewMessage('');
    setChatDialogOpen(true);
  };

  const handleContactDeliveryStaff = (order: Order) => {
    setSelectedOrder(order);
    setChatType('delivery_staff');
    setMessages([]);
    setNewMessage('');
    setChatDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate staff response after 1 second
    setTimeout(() => {
      const staffMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatType === 'customer_service' 
          ? 'Thank you for contacting us. We will review your refund request and get back to you within 3-5 business days. Is there anything else we can help you with?'
          : 'Hello! I\'m the delivery staff for your order. How can I assist you today?',
        sender: 'staff',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, staffMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  // Accept order (for delivery staff)
  const handleAcceptOrder = async (order: Order) => {
    // Check if profile is still loading
    if (loadingProfile) {
      alert('Please wait while loading delivery staff information...');
      return;
    }

    // Get current staff info, reload if needed
    let currentStaff = currentDeliveryStaff;
    
    if (!currentStaff || !currentStaff.id) {
      // Try to reload profile
      currentStaff = await loadDeliveryStaffProfile();
      
      if (!currentStaff || !currentStaff.id) {
        const errorMsg = profileError || 'Delivery staff information not loaded';
        alert(`Cannot accept order: ${errorMsg}\n\nPlease refresh the page or log in again.`);
        return;
      }
    }

    if (!order.orderid) {
      alert('Invalid order. Cannot accept.');
      return;
    }

    try {
      // Call API to accept order
      const acceptedOrder = await backendApi.acceptOrder(order.orderid);
      console.log('Order accepted:', acceptedOrder);
      
      // Reload orders to get updated list (removes accepted order from pending list)
      await loadOrders();
      
      alert('Order accepted successfully! The order will now appear in your Delivery Status page.');
    } catch (error: any) {
      console.error('Error accepting order:', error);
      alert(`Failed to accept order: ${error.response?.data || error.message}`);
    }
  };

  // Mark order as delivered
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

  const isDeliveryStaff = userRole === 'delivery';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartIcon color="primary" />
        {isDeliveryStaff ? 'Orders' : 'My Orders'}
      </Typography>

      {orders.length === 0 ? (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
            {isDeliveryStaff ? 'No orders available' : 'No orders yet'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {isDeliveryStaff ? 'Orders will appear here when available' : 'Your orders will appear here'}
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
                    {!isDeliveryStaff && (
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
                            // Calculate estimated delivery time if not saved
                            const orderDate = new Date(order.orderDate || order.createdTime || new Date());
                            const deliveryStart = new Date(orderDate.getTime() + 20 * 60 * 1000); // 20 minutes
                            const deliveryEnd = new Date(orderDate.getTime() + 30 * 60 * 1000); // 30 minutes
                            const formatTime = (date: Date) => {
                              const hours = date.getHours().toString().padStart(2, '0');
                              const minutes = date.getMinutes().toString().padStart(2, '0');
                              return `${hours}:${minutes}`;
                            };
                            return `${formatTime(deliveryStart)} - ${formatTime(deliveryEnd)}`;
                          })()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                    {/* Only show Delivery Staff info if order is not pending and has been accepted by a delivery staff */}
                    {!isDeliveryStaff && order.deliveryStaff && order.status !== 'pending' && order.deliverManId && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
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

                {/* Accept Button for Delivery Staff */}
                {isDeliveryStaff && order.status === 'pending' && !order.deliveryStaff && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    {profileError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {profileError}
                        <Button
                          size="small"
                          onClick={() => loadDeliveryStaffProfile()}
                          sx={{ mt: 1 }}
                        >
                          Retry
                        </Button>
                      </Alert>
                    )}
                    <Button
                      variant="contained"
                      startIcon={loadingProfile ? <CircularProgress size={20} color="inherit" /> : <BikeIcon />}
                      onClick={() => handleAcceptOrder(order)}
                      fullWidth
                      color="primary"
                      size="large"
                      disabled={loadingProfile || !currentDeliveryStaff || !!profileError}
                    >
                      {loadingProfile ? 'Loading Profile...' : 'Accept Order'}
                    </Button>
                  </>
                )}

                {/* Only show order details for customers, not delivery staff */}
                {!isDeliveryStaff && (
                  <>
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
                  </>
                )}


                {/* Only show customer-specific features */}
                {!isDeliveryStaff && (
                  <>
                    {/* Note: Orders are accepted by Delivery Staff through their interface */}
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

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        startIcon={<SupportIcon />}
                        onClick={() => handleRequestRefund(order)}
                        color="error"
                        sx={{ flex: 1, minWidth: '150px' }}
                      >
                        Contact Customer Service
                      </Button>
                      {/* Only show "Contact Delivery Staff" button if order has been accepted by a delivery staff */}
                      {order.deliveryStaff && order.status !== 'pending' && order.deliverManId && (
                        <Button
                          variant="outlined"
                          startIcon={<PhoneIcon />}
                          onClick={() => handleContactDeliveryStaff(order)}
                          color="primary"
                          sx={{ flex: 1, minWidth: '150px' }}
                        >
                          Contact Delivery Staff
                        </Button>
                      )}
                      {isDeliveryStaff && order.status === 'delivering' && (
                        <Button
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => markOrderAsDelivered(order)}
                          color="success"
                          sx={{ flex: 1, minWidth: '150px' }}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Chat Dialog */}
      <Dialog 
        open={chatDialogOpen} 
        onClose={() => {
          setChatDialogOpen(false);
          setMessages([]);
          setNewMessage('');
          setSelectedOrder(null);
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {chatType === 'customer_service' ? (
                <SupportIcon color="primary" />
              ) : (
                <PhoneIcon color="primary" />
              )}
              <Typography variant="h6">
                {chatType === 'customer_service' ? 'Customer Service' : 'Delivery Staff'}
              </Typography>
            </Box>
            {selectedOrder && (
              <Chip 
                label={`Order: ${selectedOrder.id}`} 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
          {selectedOrder && (
            <Alert severity="info" sx={{ m: 2, mb: 1 }}>
              <Typography variant="body2">
                <strong>Restaurant:</strong> {selectedOrder.restaurantName}
              </Typography>
              <Typography variant="body2">
                <strong>Total:</strong> ${selectedOrder.totalPrice.toFixed(2)}
              </Typography>
              {selectedOrder.estimatedDeliveryTime && (
                <Typography variant="body2">
                  <strong>Estimated Delivery:</strong> {
                    typeof selectedOrder.estimatedDeliveryTime === 'string'
                      ? selectedOrder.estimatedDeliveryTime
                      : `${selectedOrder.estimatedDeliveryTime.start} - ${selectedOrder.estimatedDeliveryTime.end}`
                  }
                </Typography>
              )}
            </Alert>
          )}

          {/* Delivery Staff Info (only for delivery staff chat) */}
          {chatType === 'delivery_staff' && selectedOrder?.deliveryStaff && (
            <Box sx={{ 
              m: 2, 
              p: 2, 
              bgcolor: 'primary.main', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="primary.contrastText" fontWeight="bold">
                  {selectedOrder.deliveryStaff.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="primary.contrastText"
                  sx={{ mt: 0.5 }}
                >
                  {selectedOrder.deliveryStaff.phone}
                </Typography>
              </Box>
              <IconButton
                onClick={() => {
                  window.location.href = `tel:${selectedOrder.deliveryStaff?.phone}`;
                }}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                aria-label="Call delivery staff"
              >
                <PhoneIcon />
              </IconButton>
            </Box>
          )}
          
          {/* Messages Area */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            bgcolor: 'background.default'
          }}>
            {messages.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                flexDirection: 'column',
                gap: 1
              }}>
                <Typography variant="body2" color="text.secondary">
                  {chatType === 'customer_service' 
                    ? 'Start a conversation with customer service'
                    : 'Start a conversation with delivery staff'}
                </Typography>
              </Box>
            ) : (
              <>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '70%',
                        bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                        color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                        border: message.sender === 'staff' ? 1 : 0,
                        borderColor: message.sender === 'staff' ? 'divider' : 'transparent'
                      }}
                    >
                      <Typography variant="body2">
                        {message.text}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          mt: 0.5,
                          opacity: 0.7
                        }}
                      >
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
        </Typography>
      </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MyOrders;

