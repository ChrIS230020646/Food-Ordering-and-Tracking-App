import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CreditCard as CreditCardIcon,
  Support as SupportIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { backendApi, CustomerProfile, CustomerAddress, DeliveryStaffProfile } from '../services/api';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

// Helper function to get user info from token and user object
const getUserInfo = () => {
  try {
    // First try to get from user object in localStorage (more complete info)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // If user object has restname, it's a restaurant profile
      if (user.restname) {
        return {
          role: 'restaurant',
          restname: user.restname,
          restid: user.restid,
          ...user
        };
      }
      // Ensure role is set from user object or token
      // If user object doesn't have role, check token
      if (!user.role) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
              ...user,
              role: payload.role || user.role || 'customer'
            };
          } catch (e) {
            // If token parsing fails, default to customer
            return {
              ...user,
              role: user.role || 'customer'
            };
          }
        }
      }
      // Otherwise return as is (customer or delivery staff)
      return user;
    }
    
    // Fallback to token if user object not available
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        role: payload.role,
        restname: payload.restname,
        restid: payload.sub, // For restaurant, subject is restid
        name: payload.name,
        email: payload.email
      };
    }
  } catch (error) {
    console.error('Error getting user info:', error);
  }
  return null;
};

// Helper function to get current user ID for storage keys
const getCurrentUserId = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Try different possible ID fields
      if (user.custid) return `user_${user.custid}`;
      if (user.id) return `user_${user.id}`;
      if (user.staffId) return `staff_${user.staffId}`;
      if (user.restid) return `rest_${user.restid}`;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) return `user_${payload.sub}`;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return null;
};

interface ProfileData {
  custid?: number;
  staffId?: number;
  restid?: number;
  custname?: string;
  name?: string;
  restname?: string;
  phone?: string;
  email?: string;
  icon?: string;
  isValidate?: boolean;
  latestLoginDate?: string;
  description?: string;
  address?: string;
}

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardInfo, setCardInfo] = useState<{
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  } | null>(null);
  
  // Dialog states
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  
  // Card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'Hong Kong',
    is_default: false
  });

  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info);
    loadProfile();
    // Pass info to loadAddresses to avoid state timing issues
    loadAddresses(info);
    // Only load payment method for customers
    if (info?.role !== 'restaurant') {
      loadPaymentMethod();
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const info = getUserInfo();
      if (!info) {
        setError('User information not found');
        setLoading(false);
        return;
      }

      // Load profile based on user role
      if (info.role === 'delivery') {
        try {
          const deliveryProfile: DeliveryStaffProfile = await backendApi.getDeliveryStaffProfile();
          setProfile({
            staffId: deliveryProfile.staffId,
            name: deliveryProfile.name,
            email: deliveryProfile.email,
            phone: deliveryProfile.phone,
            icon: deliveryProfile.icon,
            isValidate: deliveryProfile.isValidate
          });
        } catch (apiError: any) {
          console.error('Error loading delivery staff profile:', apiError);
          console.error('Error details:', {
            message: apiError.message,
            response: apiError.response?.data,
            status: apiError.response?.status,
            url: apiError.config?.url
          });
          
          // Always use fallback for delivery staff if API fails
          // This prevents auto-logout from interceptor
          const userStr = localStorage.getItem('user');
          const token = localStorage.getItem('token');
          
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              setProfile({
                staffId: user.staffId || user.id || 0,
                name: user.name || 'Delivery Staff',
                phone: user.phone || '',
                email: user.email || '',
                icon: user.icon,
                isValidate: user.isValidate !== false
              });
              // Don't set error if we successfully loaded from localStorage
              return;
            } catch (e) {
              console.error('Error parsing user from localStorage:', e);
            }
          }
          
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setProfile({
                staffId: parseInt(payload.sub) || 0,
                name: payload.name || 'Delivery Staff',
                phone: payload.phone || '',
                email: payload.email || '',
                icon: payload.icon,
                isValidate: true
              });
              // Don't set error if we successfully loaded from token
              return;
            } catch (e) {
              console.error('Error parsing token:', e);
            }
          }
          
          // Only set error if we couldn't load from fallback
          if (apiError.response?.status === 404) {
            setError('Delivery staff profile endpoint not found. Please ensure the backend is running.');
          } else if (apiError.response?.status === 401) {
            setError('Failed to load delivery staff profile. Using cached information.');
          } else {
            setError('Failed to load delivery staff profile. Please try again.');
          }
        }
      } else if (info.role === 'restaurant') {
        try {
          const restaurantProfile = await backendApi.getRestaurant(info.restid);
          setProfile({
            restid: restaurantProfile.restid,
            restname: restaurantProfile.restname,
            description: restaurantProfile.description,
            address: restaurantProfile.address,
            icon: (restaurantProfile as any).icon,
            isValidate: (restaurantProfile as any).isValidate
          });
        } catch (apiError: any) {
          console.error('Error loading restaurant profile:', apiError);
          // Fallback to localStorage
          const userStr = localStorage.getItem('user');
          const token = localStorage.getItem('token');
          
          if (userStr) {
            const user = JSON.parse(userStr);
            setProfile({
              restid: user.restid || 0,
              restname: user.restname || 'Restaurant',
              description: user.description,
              address: user.address,
              icon: user.icon,
              isValidate: user.isValidate !== false
            });
          } else if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setProfile({
              restid: parseInt(payload.sub) || 0,
              restname: payload.restname || 'Restaurant',
              description: payload.description,
              address: payload.address,
              icon: payload.icon,
              isValidate: true
            });
          }
        }
      } else if (info.role === 'customer') {
        // Customer - only load if explicitly customer role
        try {
          const customerProfile: CustomerProfile = await backendApi.getCustomerProfile();
          setProfile({
            custid: customerProfile.custid,
            custname: customerProfile.custname,
            phone: customerProfile.phone,
            email: customerProfile.email,
            icon: customerProfile.icon,
            isValidate: customerProfile.isValidate,
            latestLoginDate: customerProfile.latestLoginDate
          });
        } catch (apiError: any) {
          console.error('Error loading customer profile:', apiError);
          // Fallback to localStorage
          const userStr = localStorage.getItem('user');
          const token = localStorage.getItem('token');
          
          if (userStr) {
            const user = JSON.parse(userStr);
            setProfile({
              custid: user.custid || user.id || 0,
              custname: user.name || user.custname || user.username || 'User',
              phone: user.phone || '',
              email: user.email || '',
              icon: user.icon,
              isValidate: user.isValidate !== false,
              latestLoginDate: user.latestLoginDate
            });
          } else if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setProfile({
              custid: parseInt(payload.sub) || 0,
              custname: payload.name || payload.custname || 'User',
              phone: payload.phone || '',
              email: payload.email || '',
              icon: payload.icon,
              isValidate: true
            });
          }
        }
      } else {
        // Unknown role or role not set - use fallback from localStorage/token
        console.warn('Unknown user role:', info.role);
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setProfile({
              ...user,
              name: user.name || user.custname || 'User',
              email: user.email || '',
              phone: user.phone || ''
            });
          } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            setError('Unable to determine user role. Please log in again.');
          }
        } else if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setProfile({
              name: payload.name || 'User',
              email: payload.email || '',
              phone: payload.phone || ''
            });
          } catch (e) {
            console.error('Error parsing token:', e);
            setError('Unable to determine user role. Please log in again.');
          }
        } else {
          setError('Unable to determine user role. Please log in again.');
        }
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async (info?: any) => {
    // Use passed info or fallback to userInfo state
    const userRole = info?.role || userInfo?.role;
    
    // Only load addresses for customers
    if (userRole !== 'customer') {
      setAddresses([]);
      return;
    }
    
    try {
      const addressData = await backendApi.getCustomerAddresses();
      setAddresses(addressData);
    } catch (err: any) {
      console.error('Error loading addresses:', err);
      // Don't fallback to localStorage - show empty list instead
      setAddresses([]);
    }
  };

  const loadPaymentMethod = () => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('Cannot load payment method: User ID not found');
      return;
    }
    
    const paymentMethodKey = `paymentMethod_${userId}`;
    const cardInfoKey = `cardInfo_${userId}`;
    
    const saved = localStorage.getItem(paymentMethodKey);
    if (saved) {
      setPaymentMethod(saved);
    }
    
    const savedCardInfo = localStorage.getItem(cardInfoKey);
    if (savedCardInfo) {
      try {
        setCardInfo(JSON.parse(savedCardInfo));
      } catch (e) {
        console.error('Error parsing card info:', e);
      }
    }
  };

  const savePaymentMethod = (method: string) => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('Cannot save payment method: User ID not found');
      return;
    }
    
    setPaymentMethod(method);
    const paymentMethodKey = `paymentMethod_${userId}`;
    localStorage.setItem(paymentMethodKey, method);
  };

  const handleSaveCard = () => {
    if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryDate || !cardForm.cvv) {
      alert('Please fill in all card information');
      return;
    }
    
    const userId = getCurrentUserId();
    if (!userId) {
      alert('Cannot save card information: User ID not found');
      return;
    }
    
    setCardInfo(cardForm);
    const cardInfoKey = `cardInfo_${userId}`;
    localStorage.setItem(cardInfoKey, JSON.stringify(cardForm));
    setCardDialogOpen(false);
    setCardForm({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
  };

  const handleEditCard = () => {
    if (cardInfo) {
      setCardForm(cardInfo);
    }
    setCardDialogOpen(true);
  };

  const maskCardNumber = (cardNumber: string): string => {
    if (!cardNumber || cardNumber.length < 4) return cardNumber;
    return '**** **** **** ' + cardNumber.slice(-4);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      address_line1: '',
      address_line2: '',
      city: '',
      postal_code: '',
      country: 'Hong Kong',
      is_default: addresses.length === 0
    });
    setAddressDialogOpen(true);
  };

  const handleEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setAddressForm({
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city || '',
      postal_code: address.postal_code || '',
      country: address.country || 'Hong Kong',
      is_default: address.is_default || false
    });
    setAddressDialogOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        await backendApi.updateAddress(editingAddress.addressid, addressForm);
      } else {
        await backendApi.addAddress(addressForm);
      }
      setAddressDialogOpen(false);
      loadAddresses();
    } catch (err: any) {
      console.error('Error saving address:', err);
      alert('Failed to save address: ' + (err.response?.data || err.message));
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    try {
      await backendApi.deleteAddress(addressId);
      loadAddresses();
    } catch (err: any) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address: ' + (err.response?.data || err.message));
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      await backendApi.setDefaultAddress(addressId);
      loadAddresses();
    } catch (err: any) {
      console.error('Error setting default address:', err);
      alert('Failed to set default address: ' + (err.response?.data || err.message));
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    const labels: { [key: string]: string } = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card'
    };
    return labels[method] || method;
  };

  const getPaymentMethodIcon = () => {
    return <CreditCardIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left Column: Personal Information */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Personal Information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              {/* Restaurant Name (for restaurant users) */}
              {userInfo?.role === 'restaurant' && userInfo?.restname && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RestaurantIcon color="primary" sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Restaurant Name
                    </Typography>
                    <Typography variant="h6">
                      {userInfo.restname}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="h6">
                    {profile?.custname || 'Not set'}
                  </Typography>
                </Box>
              </Box>

              {profile?.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon color="primary" sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {profile.email}
                    </Typography>
                  </Box>
                </Box>
              )}

              {profile?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon color="primary" sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {profile.phone}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Payment Method - Only for customers */}
          {userInfo?.role !== 'restaurant' && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCardIcon color="primary" />
              Payment Method
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {['credit_card', 'debit_card'].map((method) => (
                <Button
                  key={method}
                  variant={paymentMethod === method ? 'contained' : 'outlined'}
                  onClick={() => savePaymentMethod(method)}
                  startIcon={getPaymentMethodIcon()}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  {getPaymentMethodLabel(method)}
                  {paymentMethod === method && (
                    <CheckCircleIcon sx={{ ml: 'auto' }} />
                  )}
                </Button>
              ))}
            </Box>

            {cardInfo ? (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1 
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Card Information
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={handleEditCard}
                    sx={{
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ mb: 0.5, color: 'text.primary' }}>
                  {maskCardNumber(cardInfo.cardNumber)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {cardInfo.cardHolder}
        </Typography>
        <Typography variant="body2" color="text.secondary">
                  Expires: {cardInfo.expiryDate}
                </Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setCardDialogOpen(true)}
                fullWidth
                sx={{ mt: 2 }}
              >
                Add Card Information
              </Button>
            )}
          </Paper>
          )}
        </Box>

        {/* Right Column: Address Management */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="primary" />
                Address Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddAddress}
                size="small"
              >
                Add Address
              </Button>
            </Box>

            {addresses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LocationOnIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No addresses saved
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add an address to get started
                </Typography>
              </Box>
            ) : (
              <List>
                {addresses.map((address) => (
                  <React.Fragment key={address.addressid}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {address.address_line1}
                            {address.is_default && (
                              <Chip label="Default" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            {address.address_line2 && (
                              <Typography variant="body2">{address.address_line2}</Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {[address.city, address.postal_code, address.country]
                                .filter(Boolean)
                                .join(', ')}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleEditAddress(address)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        {!address.is_default && (
                          <>
                            <IconButton
                              edge="end"
                              onClick={() => handleSetDefaultAddress(address.addressid)}
                              sx={{ mr: 1 }}
                              color="primary"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteAddress(address.addressid)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          {/* Contact Support */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupportIcon color="primary" />
              Contact Support
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Need help? Contact our customer support team.
        </Typography>
            <Button
              variant="outlined"
              startIcon={<SupportIcon />}
              onClick={() => setContactDialogOpen(true)}
              fullWidth
            >
            Contact Customer Service
          </Button>
      </Paper>
        </Box>
      </Box>

      {/* Add/Edit Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Address Line 1"
              fullWidth
              required
              value={addressForm.address_line1}
              onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Address Line 2"
              fullWidth
              value={addressForm.address_line2}
              onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="City"
                fullWidth
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              />
              <TextField
                label="Postal Code"
                fullWidth
                value={addressForm.postal_code}
                onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
              />
            </Box>
            <TextField
              label="Country"
              fullWidth
              value={addressForm.country}
              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveAddress}
            disabled={!addressForm.address_line1}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Support Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupportIcon color="primary" />
            Contact Customer Service
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              We're here to help! Contact us through:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Email Support
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                support@foodordering.com
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Phone Support
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                +852 1234 5678
              </Typography>
              
        <Typography variant="h6" gutterBottom>
                Business Hours
        </Typography>
        <Typography variant="body2" color="text.secondary">
                Monday - Sunday: 9:00 AM - 9:00 PM (HKT)
        </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              window.location.href = 'mailto:support@foodordering.com';
            }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Card Information Dialog */}
      <Dialog open={cardDialogOpen} onClose={() => {
        setCardDialogOpen(false);
        setCardForm({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCardIcon color="primary" />
            {cardInfo ? 'Edit Card Information' : 'Add Card Information'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Card Number"
              fullWidth
              required
              value={cardForm.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                setCardForm({ ...cardForm, cardNumber: formatted.slice(0, 19) });
              }}
              placeholder="1234 5678 9012 3456"
              inputProps={{ maxLength: 19 }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Card Holder Name"
              fullWidth
              required
              value={cardForm.cardHolder}
              onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Expiry Date (MM/YY)"
                fullWidth
                required
                value={cardForm.expiryDate}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }
                  setCardForm({ ...cardForm, expiryDate: value.slice(0, 5) });
                }}
                placeholder="MM/YY"
                inputProps={{ maxLength: 5 }}
              />
              <TextField
                label="CVV"
                fullWidth
                required
                type="password"
                value={cardForm.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCardForm({ ...cardForm, cvv: value.slice(0, 4) });
                }}
                placeholder="123"
                inputProps={{ maxLength: 4 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCardDialogOpen(false);
            setCardForm({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCard}
            disabled={!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryDate || !cardForm.cvv}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProfile;
