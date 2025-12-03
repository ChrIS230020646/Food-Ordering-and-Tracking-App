import { Order } from '../types/order';

export const getUserRole = (): string | null => {
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

export const getStatusColor = (status: string) => {
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

export const getStatusLabel = (status: string): string => {
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

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const convertApiOrderToLocal = (apiOrder: any): Order => {
  return {
    id: `ORDER-${apiOrder.orderid}`,
    orderid: apiOrder.orderid,
    restaurantName: apiOrder.restaurantName || 'Unknown Restaurant',
    items: (apiOrder.items || []).map((item: any) => ({
      id: item.itemId,
      itemId: item.itemId,
      name: item.itemName,
      itemName: item.itemName,
      description: item.description || '',
      price: Number(item.price),
      quantity: item.quantity,
    })),
    totalPrice: apiOrder.totalAmount ? Number(apiOrder.totalAmount) : (() => {
      const itemsTotal = (apiOrder.items || []).reduce((sum: number, item: any) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);
      return itemsTotal;
    })(),
    totalAmount: apiOrder.totalAmount ? Number(apiOrder.totalAmount) : (() => {
      const itemsTotal = (apiOrder.items || []).reduce((sum: number, item: any) => {
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