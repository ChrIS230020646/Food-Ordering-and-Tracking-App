import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

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
  user?: any;
}

export const backendApi = {

  healthCheck: (): Promise<string> => 
    api.get('/health').then(res => res.data),

  sayHello: (name: string): Promise<string> => 
    api.get(`/hello/${name}`).then(res => res.data),
  
  getUsers: (): Promise<User[]> => 
    api.get('/users').then(res => res.data),
  
  createUser: (user: Omit<User, 'id'>): Promise<User> => 
    api.post('/user', user).then(res => res.data),

  register: (data: RegisterData): Promise<any> =>
    api.post('/auth/register', data).then(res => res.data),

  login: (data: LoginData): Promise<any> =>
    api.post('/auth/login', data).then(res => res.data),
};

export default api;