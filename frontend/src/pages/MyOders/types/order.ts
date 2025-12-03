export interface OrderItem {
  id?: number;
  itemId?: number;
  name: string;
  itemName?: string;
  description: string;
  price: number;
  quantity: number;
  restaurant?: string;
}

export interface DeliveryStaff {
  id: string;
  name: string;
  phone: string;
}

export interface Order {
  id: string;
  orderid?: number;
  restaurantName: string;
  items: OrderItem[];
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
  deliveryStaff?: DeliveryStaff;
  deliverManId?: number;
  deliveryStaffName?: string;
  deliveryStaffPhone?: string;
  deliveryLocation?: {
    lat: number;
    lng: number;
  };
  completedDate?: string;
  endDeliverTime?: string;
  shippingAddress?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'staff';
  timestamp: Date;
}