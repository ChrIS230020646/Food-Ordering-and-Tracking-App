import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { backendApi } from '../../services/api';


import CustomerOrders from './CustomerOrders';
import DeliveryStaffOrders from './DeliveryStaffOrders';
import RestaurantOrders from './RestaurantOrders'; 
import ChatDialog from './ChatDialog'; 
import { Order, Message } from './types/order';
import { 
  getUserRole, 
  convertApiOrderToLocal 
} from './utils/orderHelpers';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chatType, setChatType] = useState<'customer_service' | 'delivery_staff'>('customer_service');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
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
    
    
    if (role === 'delivery') {
      const timer = setTimeout(() => {
        loadDeliveryStaffProfile();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (userRole !== null) {
      loadOrders();
    }
  }, [userRole]);

  
  useEffect(() => {
    if (userRole !== null) {
      const interval = setInterval(() => {
        loadOrders();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadDeliveryStaffProfile = async (retryCount = 0): Promise<{ id: string; name: string; phone: string } | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, waiting...');
      if (retryCount < 3) {
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

  const loadOrders = async () => {
    try {
      setLoading(true);
      const currentRole = userRole || getUserRole();
      
      if (currentRole === 'delivery') {
        const pendingOrders = await backendApi.getPendingOrders();
        console.log('MyOrders - Loaded pending orders:', pendingOrders);
        
        const unacceptedOrders = pendingOrders.filter(order => 
          order.status === 'pending' && !order.deliverManId
        );
        
        const convertedOrders = unacceptedOrders.map(convertApiOrderToLocal);
        setOrders(convertedOrders);
      } else if (currentRole === 'customer') {
        const apiOrders = await backendApi.getCustomerOrders();
        console.log('MyOrders - Loaded customer orders from API:', apiOrders);
        
        const convertedOrders = apiOrders.map(convertApiOrderToLocal);
        setOrders(convertedOrders);
      } else if (currentRole === 'restaurant') {
        
        const apiOrders = await backendApi.getCustomerOrders();
        const convertedOrders = apiOrders.map(convertApiOrderToLocal);
        setOrders(convertedOrders);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error loading orders from API:', error);
      setError(error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  
  const handleAcceptOrder = async (order: Order) => {
    if (loadingProfile) {
      alert('Please wait while loading delivery staff information...');
      return;
    }

    let currentStaff = currentDeliveryStaff;
    
    if (!currentStaff || !currentStaff.id) {
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
      const acceptedOrder = await backendApi.acceptOrder(order.orderid);
      console.log('Order accepted:', acceptedOrder);
      
      await loadOrders();
      
      alert('Order accepted successfully! The order will now appear in your Delivery Status page.');
    } catch (error: any) {
      console.error('Error accepting order:', error);
      alert(`Failed to accept order: ${error.response?.data || error.message}`);
    }
  };

  
  const markOrderAsDelivered = async (order: Order) => {
    if (!order.orderid) {
      alert('Invalid order. Cannot mark as delivered.');
      return;
    }

    try {
      await backendApi.updateOrderStatus(order.orderid, 'delivered');
      await loadOrders();
      alert('Order marked as delivered successfully!');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(`Failed to update order status: ${error.response?.data || error.message}`);
    }
  };

  
  const handleUpdateOrderStatus = async (order: Order) => {
    
    console.log('Update order status for restaurant:', order);
    
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

  const isDeliveryStaff = userRole === 'delivery';

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartIcon color="primary" />
        {isDeliveryStaff ? 'Available Orders' : 
         userRole === 'restaurant' ? 'Restaurant Orders' : 'My Orders'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {isDeliveryStaff ? 'No orders available' : 
             userRole === 'restaurant' ? 'No restaurant orders' : 'No orders yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {isDeliveryStaff ? 'Orders will appear here when available' : 
             userRole === 'restaurant' ? 'Restaurant orders will appear here' : 'Your orders will appear here'}
          </Typography>
        </Paper>
      ) : (
        <>
          {userRole === 'customer' && (
            <CustomerOrders
              orders={orders}
              onContactCustomerService={handleRequestRefund}
              onContactDeliveryStaff={handleContactDeliveryStaff}
            />
          )}
          
          {userRole === 'delivery' && (
            <DeliveryStaffOrders
              orders={orders}
              loadingProfile={loadingProfile}
              profileError={profileError}
              currentDeliveryStaff={currentDeliveryStaff}
              onAcceptOrder={handleAcceptOrder}
              onMarkAsDelivered={markOrderAsDelivered}
              onRetryProfile={loadDeliveryStaffProfile}
            />
          )}

          {userRole === 'restaurant' && (
            <RestaurantOrders
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}
        </>
      )}

      {/* Chat Dialog */}
      <ChatDialog
        open={chatDialogOpen}
        order={selectedOrder}
        chatType={chatType}
        messages={messages}
        newMessage={newMessage}
        onClose={() => {
          setChatDialogOpen(false);
          setMessages([]);
          setNewMessage('');
          setSelectedOrder(null);
        }}
        onSendMessage={handleSendMessage}
        onMessageChange={setNewMessage}
        messagesEndRef={messagesEndRef}
      />
    </Box>
  );
};

export default MyOrders;