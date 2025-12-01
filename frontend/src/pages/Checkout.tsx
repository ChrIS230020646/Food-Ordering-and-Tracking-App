import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Alert,
  IconButton,
  List,
  ListItem,
  FormControl,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Restaurant as RestaurantIcon,
  CreditCard as CreditCardIcon,
  LocalAtm as CashIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { backendApi, CustomerAddress } from '../services/api';

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

interface CartItem {
  id: number;
  item_ID?: number; // Database item_ID
  name: string;
  description: string;
  price: number;
  quantity: number;
  restaurant?: string;
  restid?: number; // Restaurant ID
}

interface CheckoutData {
  cart: CartItem[];
  restaurantName: string;
  restid?: number; // Add restid
  totalPrice: number;
}


const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    custid?: number;
  }>({});
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardInfo, setCardInfo] = useState<{
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  } | null>(null);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    // Get checkout data from location state
    const state = location.state as CheckoutData | null;
    
    if (!state || !state.cart || state.cart.length === 0 || !state.restid) {
      console.error('Missing checkout data or restaurant ID. Redirecting to dashboard.');
      navigate('/dashboard');
      return;
    }

    setCheckoutData(state);

    // Load customer info and addresses from API
    loadCustomerInfo();
    loadAddresses();

    // Calculate estimated delivery time (10 minutes from now)
    const now = new Date();
    const deliveryStart = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    const deliveryEnd = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes (10 minute window)

    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    setEstimatedDelivery({
      start: formatTime(deliveryStart),
      end: formatTime(deliveryEnd)
    });

    // Load payment method and card info from localStorage (synced from My Profile)
    // Note: Payment method and card info are still stored in localStorage for now
    // as they are user preferences, not server-side data
    const userId = getCurrentUserId();
    if (userId) {
      const paymentMethodKey = `paymentMethod_${userId}`;
      const cardInfoKey = `cardInfo_${userId}`;
      
      const savedPaymentMethod = localStorage.getItem(paymentMethodKey);
      if (savedPaymentMethod) {
        setPaymentMethod(savedPaymentMethod);
      }
      
      const savedCardInfo = localStorage.getItem(cardInfoKey);
      if (savedCardInfo) {
        try {
          setCardInfo(JSON.parse(savedCardInfo));
        } catch (e) {
          console.error('Error parsing card info:', e);
        }
      }
    }
  }, [location, navigate]);

  // Load customer info from API
  const loadCustomerInfo = async () => {
    try {
      const profile = await backendApi.getCustomerProfile();
      setCustomerInfo({
        name: profile.custname,
        phone: profile.phone || '',
        email: profile.email || '',
        custid: profile.custid
      });
    } catch (error: any) {
      console.error('Error loading customer profile:', error);
      // Fallback to token if API fails
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCustomerInfo({
            name: payload.name || payload.custname || 'Customer',
            phone: payload.phone || '',
            email: payload.email || '',
            custid: parseInt(payload.sub) || 0
          });
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  };

  // Load addresses from API
  const loadAddresses = async () => {
    try {
      const fetchedAddresses = await backendApi.getCustomerAddresses();
      setAddresses(fetchedAddresses);
    } catch (error: any) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
    }
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod || !checkoutData) {
      alert('Please select a payment method');
      return;
    }
    
    // Validate card information for credit/debit card payments
    if ((paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && !cardInfo) {
      alert('Please add your card information before placing an order.');
      setCardDialogOpen(true);
      return;
    }

    try {
      console.log('Starting order placement...');
      
      // Get restaurant ID from state (passed from RestaurantDetail)
      const restid = checkoutData.restid;
      if (!restid) {
        alert('Restaurant ID not found. Please try again.');
        return;
      }
      console.log('Using restaurant ID:', restid, 'for restaurant:', checkoutData.restaurantName);

      // Get default address ID (or use null if not available)
      let addressid: number | undefined = undefined;
      try {
        const addresses = await backendApi.getCustomerAddresses();
        const defaultAddress = addresses.find(addr => addr.is_default);
        if (defaultAddress) {
          addressid = defaultAddress.addressid;
        } else if (addresses.length > 0) {
          addressid = addresses[0].addressid;
        }
        console.log('Using address ID:', addressid);
      } catch (e) {
        console.warn('Could not fetch addresses, proceeding without addressid:', e);
      }

      // Convert payment method to match backend enum
      let paymentMethodForBackend = paymentMethod;
      if (paymentMethod === 'cash') {
        paymentMethodForBackend = 'cash_on_delivery';
      }

      // Prepare order request
      const orderRequest = {
        restid: restid,
        restaurantName: checkoutData.restaurantName,
        addressid: addressid,
        shippingAddress: customerInfo.address || 'Address not set',
        paymentMethod: paymentMethodForBackend,
        remark: '',
        items: checkoutData.cart.map(item => ({
          itemId: item.item_ID || item.id, // Use item_ID from database, fallback to id
          itemName: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log('Sending order request:', orderRequest);

      // Create order via API
      const createdOrder = await backendApi.createOrder(orderRequest);
      
      console.log('Order placed successfully:', createdOrder);
      alert(`Order placed successfully with ${getPaymentMethodLabel(paymentMethod)}!`);
      
      // Navigate to orders page after placing order
      navigate('/dashboard/orders');
    } catch (error: any) {
      console.error('Error placing order:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      let errorMessage = 'Failed to place order';
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please ensure the backend is running and restarted.';
      } else if (error.message?.includes('Network Error') || !error.response) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:8080';
      } else if (error.response?.data) {
        errorMessage = `Failed to place order: ${error.response.data}`;
      } else {
        errorMessage = `Failed to place order: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    const labels: { [key: string]: string } = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'cash': 'Cash on Delivery'
    };
    return labels[method] || method;
  };

  const maskCardNumber = (cardNumber: string): string => {
    if (!cardNumber || cardNumber.length < 4) return cardNumber;
    return '**** **** **** ' + cardNumber.slice(-4);
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

  if (!checkoutData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Loading checkout information...</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
          aria-label="go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Checkout
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr'
          },
          gap: 3
        }}
      >
        {/* Left Column: Order Details and Customer Info */}
        <Box>
          {/* Customer Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantIcon color="primary" />
              Delivery Information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                <LocationOnIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Delivery Address
                  </Typography>
                  <Typography variant="body1">
                    {(() => {
                      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
                      if (defaultAddress) {
                        return `${defaultAddress.address_line1}${defaultAddress.address_line2 ? ', ' + defaultAddress.address_line2 : ''}, ${defaultAddress.city || ''}, ${defaultAddress.country || 'Hong Kong'}`;
                      }
                      return customerInfo.address || 'Address not set';
                    })()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1">
                    {customerInfo.phone || 'Phone not set'}
                  </Typography>
                </Box>
              </Box>

              {customerInfo.name && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Customer Name
                    </Typography>
                    <Typography variant="body1">
                      {customerInfo.name}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Estimated Delivery Time */}
          {estimatedDelivery && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon />
                <Typography variant="h6">
                  Estimated Delivery Time
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {estimatedDelivery.start} - {estimatedDelivery.end}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Approximately 10 minutes
              </Typography>
            </Paper>
          )}

          {/* Order Details */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Order Details
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Restaurant: {checkoutData.restaurantName}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <List>
              {checkoutData.cart.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      px: 0,
                      py: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3">
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < checkoutData.cart.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Right Column: Order Summary */}
        <Box>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body1">
                  ${checkoutData.totalPrice.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Delivery Fee
                </Typography>
                <Typography variant="body1">
                  $0.00
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Total
                </Typography>
                <Typography variant="h6" color="primary">
                  ${checkoutData.totalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Payment Method Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Method
                </Typography>
              </FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Credit Card with Add Button */}
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Button
                    variant={paymentMethod === 'credit_card' ? 'contained' : 'outlined'}
                    onClick={() => savePaymentMethod('credit_card')}
                    startIcon={<CreditCardIcon />}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.5,
                      pr: 5
                    }}
                  >
                    Credit Card
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => setCardDialogOpen(true)}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      p: 0.5,
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'primary.main'
                      }
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {/* Debit Card with Add Button */}
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Button
                    variant={paymentMethod === 'debit_card' ? 'contained' : 'outlined'}
                    onClick={() => savePaymentMethod('debit_card')}
                    startIcon={<CreditCardIcon />}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.5,
                      pr: 5
                    }}
                  >
                    Debit Card
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => setCardDialogOpen(true)}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      p: 0.5,
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'primary.main'
                      }
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {/* Cash on Delivery */}
                <Button
                  variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
                  onClick={() => savePaymentMethod('cash')}
                  startIcon={<CashIcon />}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Cash on Delivery
                </Button>
              </Box>
              
              {/* Display saved card information if available */}
              {cardInfo && (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
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
              )}
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePlaceOrder}
              disabled={!paymentMethod}
              sx={{ mt: 2 }}
            >
              Place Order
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(-1)}
              sx={{ mt: 1 }}
            >
              Back to Cart
            </Button>
          </Paper>
        </Box>
      </Box>

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

export default Checkout;

