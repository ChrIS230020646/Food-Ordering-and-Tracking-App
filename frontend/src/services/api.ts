import axios, { AxiosInstance, AxiosError } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only auto-logout if it's a clear authentication error
      // Don't logout for endpoint-specific 401s (e.g., wrong role accessing wrong endpoint)
      const url = error.config?.url || '';
      const isEndpointSpecificError = 
        url.includes('/customer/profile') || 
        url.includes('/delivery/profile') || 
        url.includes('/restaurant/');
      
      // If it's an endpoint-specific error, don't auto-logout
      // The component should handle it with fallback
      if (!isEndpointSpecificError) {
        // Token expired or invalid - clear auth and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== Interfaces ====================

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
  userType: string;
  location: string;
  name: string;

  // for customer address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  
  // for restaurant
  restname?: string;
  description?: string;
  address?: string;
  cuisine?: string;

  // for delivery
  vehicleType?: string;
  licenseNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
  userType: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
}

// Restaurant interfaces
export interface Restaurant {
  icon: string;
  restid: number;
  restname: string;
  description?: string;
  address?: string;
  cuisine?: string;
  phone?: string;
  email?: string;
  avgRating?: number;      // 平均評分 (1-5)
  ratingCount?: number;    // 評分數量
}

// Menu Item interfaces
export interface MenuItem {
  item_ID: number;
  restid: number;
  category?: string;
  item_name: string;
  description?: string;
  price: number;
  status?: 'active' | 'inactive' | 'out_of_stock';
}

// Order interfaces
export interface OrderItem {
  itemId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  restid: number;
  restaurantName: string;
  shippingAddress: string;
  addressid?: number;
  paymentMethod: string;
  remark?: string;
  items: Array<{
    itemId: number;
    itemName: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
}

export interface Order {
  orderid: number;
  custid: number;
  restid: number;
  restaurantName?: string;
  addressid?: number;
  shippingAddress?: string;
  deliverManId?: number;
  deliveryStaffName?: string;
  deliveryStaffPhone?: string;
  startDeliverTime?: string;
  endDeliverTime?: string;
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  remark?: string;
  totalAmount: number;
  discountAmount?: number;
  createdTime: string;
  items?: OrderItemDetail[];
  paymentMethod?: string;
  estimatedDeliveryTime?: string;
}

export interface OrderItemDetail {
  itemId: number;
  itemName: string;
  description?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderDetail extends Order {
  items: OrderItemDetail[];
  restaurant?: Restaurant;
}

// Order review interfaces
export interface OrderReview {
  reviewId: number;
  orderId: number;
  restRating: number;
  deliveryRating: number;
  comment?: string;
  createdTime?: string;
  updatedTime?: string;
}

// Customer interfaces
export interface CustomerProfile {
  custid: number;
  custname: string;
  phone?: string;
  email?: string;
  icon?: string;
  isValidate: boolean;
  latestLoginDate?: string;
}

export interface CustomerAddress {
  addressid: number;
  custid: number;
  address_line1: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_default: boolean;
}

// Delivery Staff interfaces
export interface DeliveryStaffProfile {
  staffId: number;
  name: string;
  email: string;
  phone?: string;
  icon?: string;
  isValidate: boolean;
}

// ==================== API Functions ====================

export const backendApi = {
  // ========== Health & Test ==========
  healthCheck: (): Promise<string> => 
    api.get('/health').then(res => res.data),

  sayHello: (name: string): Promise<string> => 
    api.get(`/hello/${name}`).then(res => res.data),
  
  getUsers: (): Promise<User[]> => 
    api.get('/users').then(res => res.data),
  
  createUser: (user: Omit<User, 'id'>): Promise<User> => 
    api.post('/user', user).then(res => res.data),

  // ========== Authentication ==========
  register: (data: RegisterData): Promise<any> =>
    api.post('/auth/register', data).then(res => res.data),

  login: (data: LoginData): Promise<LoginResponse> =>
    api.post('/auth/login', data).then(res => res.data),

  // ========== Restaurants ==========
  /**
   * Get all restaurants
   */
  getRestaurants: (): Promise<Restaurant[]> =>
    api.get('/restaurants').then(res => res.data),

  /**
   * Get restaurant by ID
   */
  getRestaurant: (restid: number): Promise<Restaurant> =>
    api.get(`/restaurants/${restid}`).then(res => res.data),

  /**
   * Get restaurant by name
   */
  getRestaurantByName: (restname: string): Promise<Restaurant> =>
    api.get(`/restaurants/name/${encodeURIComponent(restname)}`).then(res => res.data),

  // ========== Menu Items ==========
  /**
   * Get all menu items for a restaurant
   */
  getMenuItems: (restid: number): Promise<MenuItem[]> =>
    api.get(`/restaurants/${restid}/menu`).then(res => res.data),

  /**
   * Get menu item by ID
   */
  getMenuItem: (itemId: number): Promise<MenuItem> =>
    api.get(`/menu-items/${itemId}`).then(res => res.data),

  // ========== Orders ==========
  /**
   * Create a new order
   */
  createOrder: (orderData: CreateOrderRequest): Promise<Order> =>
    api.post('/orders', orderData).then(res => res.data),

  /**
   * Get all orders for current customer
   */
  getCustomerOrders: (): Promise<Order[]> =>
    api.get('/orders/customer').then(res => res.data),

  /**
   * Get pending orders for delivery staff
   */
  getPendingOrders: (): Promise<Order[]> =>
    api.get('/orders/pending').then(res => res.data),

  /**
   * Get delivery staff's assigned orders
   */
  getDeliveryStaffOrders: (): Promise<Order[]> =>
    api.get('/orders/delivery').then(res => res.data),

  /**
   * Accept an order (Delivery Staff only)
   */
  acceptOrder: (orderId: number): Promise<Order> =>
    api.post(`/orders/${orderId}/accept`).then(res => res.data),

  /**
   * Update order status
   */
  updateOrderStatus: (orderId: number, status: string): Promise<Order> =>
    api.put(`/orders/${orderId}/status`, { status }).then(res => res.data),

  /**
   * Get order by ID
   */
  getOrder: (orderId: number): Promise<OrderDetail> =>
    api.get(`/orders/${orderId}`).then(res => res.data),

  /**
   * Get order history for current customer
   */
  getOrderHistory: (): Promise<Order[]> =>
    api.get('/orders/history').then(res => res.data),

  /**
   * Get review for a specific order (customer only)
   */
  getOrderReview: (orderId: number): Promise<OrderReview> =>
    api.get(`/orders/${orderId}/review`).then(res => res.data),

  /**
   * Create or update review for a specific order (customer only)
   */
  submitOrderReview: (orderId: number, data: { restRating: number; deliveryRating: number; comment?: string }): Promise<OrderReview> =>
    api.post(`/orders/${orderId}/review`, data).then(res => res.data),

  /**
   * Cancel an order
   */
  cancelOrder: (orderId: number): Promise<Order> =>
    api.put(`/orders/${orderId}/cancel`).then(res => res.data),

  // ========== Customer Profile ==========
  /**
   * Get current customer profile
   */
  getCustomerProfile: (): Promise<CustomerProfile> =>
    api.get('/customer/profile').then(res => res.data),

  /**
   * Update customer profile
   */
  updateCustomerProfile: (data: Partial<CustomerProfile>): Promise<CustomerProfile> =>
    api.put('/customer/profile', data).then(res => res.data),

  // ========== Customer Addresses ==========
  /**
   * Get all addresses for current customer
   */
  getCustomerAddresses: (): Promise<CustomerAddress[]> =>
    api.get('/customer/addresses').then(res => res.data),

  /**
   * Get default address for current customer
   */
  getDefaultAddress: (): Promise<CustomerAddress> =>
    api.get('/customer/addresses/default').then(res => res.data),

  /**
   * Add a new address
   */
  addAddress: (address: Omit<CustomerAddress, 'addressid' | 'custid'>): Promise<CustomerAddress> =>
    api.post('/customer/addresses', address).then(res => res.data),

  /**
   * Update an address
   */
  updateAddress: (addressId: number, address: Partial<CustomerAddress>): Promise<CustomerAddress> =>
    api.put(`/customer/addresses/${addressId}`, address).then(res => res.data),

  /**
   * Delete an address
   */
  deleteAddress: (addressId: number): Promise<void> =>
    api.delete(`/customer/addresses/${addressId}`).then(res => res.data),

  /**
   * Set default address
   */
  setDefaultAddress: (addressId: number): Promise<CustomerAddress> =>
    api.put(`/customer/addresses/${addressId}/default`).then(res => res.data),

  // ========== Restaurant Management (for restaurant users) ==========
  /**
   * Get menu items for current restaurant
   */
  getMyMenuItems: (): Promise<MenuItem[]> =>
    api.get('/restaurant/menu').then(res => res.data),

  /**
   * Add menu item (restaurant only)
   */
  addMenuItem: (item: Omit<MenuItem, 'item_ID' | 'restid'>): Promise<MenuItem> =>
    api.post('/restaurant/menu', item).then(res => res.data),

  /**
   * Update menu item (restaurant only)
   */
  updateMenuItem: (itemId: number, item: Partial<MenuItem>): Promise<MenuItem> =>
    api.put(`/restaurant/menu/${itemId}`, item).then(res => res.data),

  /**
   * Delete menu item (restaurant only)
   */
  deleteMenuItem: (itemId: number): Promise<void> =>
    api.delete(`/restaurant/menu/${itemId}`).then(res => res.data),

  /**
   * Get orders for current restaurant
   */
  getRestaurantOrders: (): Promise<Order[]> =>
    api.get('/restaurant/orders').then(res => res.data),

  /**
   * Update order status (restaurant only)
   */
  updateRestaurantOrderStatus: (orderId: number, status: Order['status']): Promise<Order> =>
    api.put(`/restaurant/orders/${orderId}/status`, { status }).then(res => res.data),

  // ========== Delivery Staff ==========
  /**
   * Get current delivery staff profile
   */
  getDeliveryStaffProfile: (): Promise<DeliveryStaffProfile> =>
    api.get('/delivery/profile').then(res => res.data),

  /**
   * Get available orders for delivery staff
   */
  getAvailableOrders: (): Promise<Order[]> =>
    api.get('/delivery/orders/available').then(res => res.data),

  /**
   * Get assigned orders for current delivery staff
   */
  getMyDeliveries: (): Promise<Order[]> =>
    api.get('/delivery/orders').then(res => res.data),

  /**
   * Accept an order for delivery
   */
  acceptDelivery: (orderId: number): Promise<Order> =>
    api.post(`/delivery/orders/${orderId}/accept`).then(res => res.data),

  /**
   * Update delivery status
   */
  updateDeliveryStatus: (orderId: number, status: 'out_for_delivery' | 'delivered'): Promise<Order> =>
    api.put(`/delivery/orders/${orderId}/status`, { status }).then(res => res.data),
};

export default api;