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
  Alert,
  Button
} from '@mui/material';
import {
  History as HistoryIcon,
  Restaurant as RestaurantIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { backendApi, Order as ApiOrder, OrderReview } from '../services/api';
import OrderReviewDialog from './MyOders/OrderReviewDialog';
import { getUserRole } from './MyOders/utils/orderHelpers';

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
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // 評分相關 state（只用於 customer）
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTargetOrder, setReviewTargetOrder] = useState<Order | null>(null);
  const [currentReview, setCurrentReview] = useState<OrderReview | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [orderHasReview, setOrderHasReview] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (userRole !== null) {
      loadOrderHistory();
    }
  }, [userRole]);

  // 載入訂單時檢查評分狀態（使用並發請求提高性能，只用於 customer）
  useEffect(() => {
    const checkReviews = async () => {
      // 只有 customer 用戶需要檢查評分狀態
      if (userRole !== 'customer') return;
      
      const reviewPromises = orders
        .filter(order => order.orderid)
        .map(async (order) => {
          try {
            await backendApi.getOrderReview(order.orderid!);
            return { orderid: order.orderid!, hasReview: true };
          } catch (error: any) {
            if (error?.response?.status !== 404) {
              console.error('Error checking review for order', order.orderid, error);
            }
            return { orderid: order.orderid!, hasReview: false };
          }
        });

      const results = await Promise.all(reviewPromises);
      const reviewMap = new Map<number, boolean>();
      results.forEach(result => {
        reviewMap.set(result.orderid, result.hasReview);
      });
      setOrderHasReview(reviewMap);
    };

    if (orders.length > 0 && userRole === 'customer') {
      checkReviews();
    }
  }, [orders, userRole]);

  // Convert API Order format to local Order format
  const convertApiOrderToLocalLocal = (apiOrder: ApiOrder): Order => {
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
      const currentRole = userRole || getUserRole();
      let apiOrders: ApiOrder[] = [];
      
      if (currentRole === 'restaurant') {
        // 對於 restaurant：獲取所有訂單，然後過濾出已送達的訂單
        apiOrders = await backendApi.getRestaurantOrders();
        console.log('Order History (Restaurant) - Loaded orders from API:', apiOrders);
      } else if (currentRole === 'customer') {
        // 對於 customer：使用現有的 API（已經過濾為已送達的訂單）
        apiOrders = await backendApi.getOrderHistory();
        console.log('Order History (Customer) - Loaded orders from API:', apiOrders);
      } else {
        setError('This page is only available for customer or restaurant users.');
        setOrders([]);
        return;
      }
      
      console.log('Order History - Number of orders:', apiOrders.length);
      
      // Convert API orders to local format
      const convertedOrders = apiOrders.map(convertApiOrderToLocalLocal);
      
      // 確保只顯示已完成的訂單（status === 'delivered'）
      const deliveredOrders = convertedOrders.filter(order => order.status === 'delivered');
      console.log('Order History - Filtered delivered orders:', deliveredOrders.length, 'out of', convertedOrders.length);
      
      setOrders(deliveredOrders);
      console.log('Order History - Converted orders:', deliveredOrders);
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

  // 開啟評分對話框
  const handleOpenReviewDialog = async (order: Order) => {
    if (!order.orderid) return;
    setReviewTargetOrder(order);
    setCurrentReview(null);
    setLoadingReview(true);

    try {
      const review = await backendApi.getOrderReview(order.orderid);
      setCurrentReview(review);
      
      // 更新評分狀態映射
      setOrderHasReview(prev => {
        const newMap = new Map(prev);
        newMap.set(order.orderid!, true);
        return newMap;
      });
    } catch (error: any) {
      // 404 表示尚未有評價，更新狀態為沒有評分
      if (error?.response?.status === 404) {
        setOrderHasReview(prev => {
          const newMap = new Map(prev);
          newMap.set(order.orderid!, false);
          return newMap;
        });
      } else {
        console.error('Error loading order review:', error);
      }
    } finally {
      setLoadingReview(false);
      setReviewDialogOpen(true);
    }
  };

  // 提交評分
  const handleSubmitReview = async (data: { restRating: number; deliveryRating: number; comment?: string }) => {
    if (!reviewTargetOrder?.orderid) return;
    
    // 如果已經有評分，不允許提交
    if (currentReview) {
      alert('此訂單已經評分，無法修改');
      return;
    }
    
    try {
      const saved = await backendApi.submitOrderReview(reviewTargetOrder.orderid, data);
      setCurrentReview(saved);
      
      // 更新評分狀態映射
      setOrderHasReview(prev => {
        const newMap = new Map(prev);
        if (reviewTargetOrder.orderid) {
          newMap.set(reviewTargetOrder.orderid, true);
        }
        return newMap;
      });
      
      setReviewDialogOpen(false);
      setReviewTargetOrder(null);
      alert('感謝您的評價！');
      
      // 重新載入訂單以更新狀態
      await loadOrderHistory();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      alert(`無法送出評價：${errorMessage}`);
    }
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
                    {userRole === 'restaurant' ? 'Total (After 10% Delivery Fee)' : 'Total'}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${userRole === 'restaurant' ? (order.totalPrice * 0.9).toFixed(2) : order.totalPrice.toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Rate Button (only for customer) */}
                {order.orderid && userRole === 'customer' && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<StarIcon />}
                      onClick={() => handleOpenReviewDialog(order)}
                      color="primary"
                      size="large"
                    >
                      {orderHasReview.get(order.orderid) ? 'View Rating' : 'Rate This Order'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Review Dialog */}
      <OrderReviewDialog
        open={reviewDialogOpen}
        order={reviewTargetOrder}
        initialReview={currentReview}
        loading={loadingReview}
        onClose={() => {
          setReviewDialogOpen(false);
          setReviewTargetOrder(null);
          setCurrentReview(null);
        }}
        onSubmit={handleSubmitReview}
      />
    </Box>
  );
};

export default OrderHistory;