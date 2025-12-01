import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Drawer,
  List,
  ListItem,
  TextField,
  Divider,
  Badge
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { backendApi, MenuItem } from '../services/api';

interface FoodItem {
  id: number;
  item_ID?: number; // Database item_ID
  name: string;
  description: string;
  price: number;
  image?: string;
  restaurant?: string;
  restid?: number; // Restaurant ID
}

interface CartItem extends FoodItem {
  quantity: number;
}

const RestaurantDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [restid, setRestid] = useState<number | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    // Get restaurant info from location state
    const state = location.state as { restaurantName?: string; restid?: number };
    const restaurant = state?.restaurantName || new URLSearchParams(location.search).get('restaurant') || '';
    const restaurantId = state?.restid;
    
    if (restaurant && restaurantId) {
      setRestaurantName(restaurant);
      setRestid(restaurantId);
      fetchRestaurantMenu(restaurantId);
    } else {
      setError('Restaurant not found');
    }
  }, [location]);

  const fetchRestaurantMenu = async (restaurantId: number) => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching menu items for restaurant ID:', restaurantId);
      // Fetch menu items from API using restid
      const menuItems: MenuItem[] = await backendApi.getMenuItems(restaurantId);
      console.log('Menu items received:', menuItems);
      console.log('Menu items count:', menuItems?.length);
      
      if (!menuItems || menuItems.length === 0) {
        console.warn('No menu items found for restaurant ID:', restaurantId);
        setError('No menu items found for this restaurant. Please check if the database has menu items for this restaurant.');
        setFoods([]);
        return;
      }
      
      const foodsList: FoodItem[] = menuItems
        .filter(item => item.status === 'active') // Only show active items
        .map(item => ({
          id: item.item_ID, // Use item_ID as id
          item_ID: item.item_ID,
          name: item.item_name,
          description: item.description || '',
          price: Number(item.price),
          restaurant: restaurantName,
          restid: item.restid
        }));
      
      console.log('Foods list created:', foodsList);
      setFoods(foodsList);
      
      if (foodsList.length === 0) {
        setError('No active menu items found for this restaurant.');
      }
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      
      let errorMessage = 'Failed to load menu items. Please try again.';
      if (err.response?.status === 404) {
        errorMessage = 'Menu items endpoint not found. Please ensure the backend is running and restarted.';
      } else if (err.message?.includes('Network Error') || !err.response) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:8080';
      } else if (err.response?.data) {
        errorMessage = `Failed to load menu items: ${err.response.data}`;
      } else if (err.message) {
        errorMessage = `Failed to load menu items: ${err.message}`;
      }
      
      setError(errorMessage);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (food: FoodItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === food.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...food, quantity: 1 }];
      }
    });
    setCartOpen(true);
  };

  const updateQuantity = (foodId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === foodId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (foodId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== foodId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
            aria-label="go back"
          >
            <ArrowBackIcon />
          </IconButton>
          <RestaurantIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h4" component="h1">
            {restaurantName}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setCartOpen(true)}
          color="primary"
          aria-label="shopping cart"
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={getTotalItems()} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : foods.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No menu items found for this restaurant
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          {foods.map((food) => (
            <Card key={food.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {food.image ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={food.image}
                  alt={food.name}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200'
                  }}
                >
                  <RestaurantIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {food.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {food.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${food.price.toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => addToCart(food)}
                  fullWidth
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Shopping Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Shopping Cart
            </Typography>
            <IconButton onClick={() => setCartOpen(false)}>
              <ArrowBackIcon />
            </IconButton>
          </Box>

          {cart.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <ShoppingCartIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Your cart is empty
                </Typography>
              </Box>
            </Paper>
          ) : (
            <>
              <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {cart.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        px: 0
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${item.price.toFixed(2)} each
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          color="error"
                          aria-label="remove item"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="decrease quantity"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            updateQuantity(item.id, value);
                          }}
                          inputProps={{
                            min: 0,
                            style: { textAlign: 'center' }
                          }}
                          sx={{ width: 80 }}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="increase quantity"
                        >
                          <AddIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ ml: 'auto' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    ${getTotalPrice().toFixed(2)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => {
                    if (cart.length === 0) {
                      alert('Your cart is empty');
                      return;
                    }
                    if (!restid) {
                      alert('Restaurant ID not found. Please try again.');
                      return;
                    }
                    navigate('/dashboard/checkout', {
                      state: {
                        cart: cart,
                        restaurantName: restaurantName,
                        restid: restid,
                        totalPrice: getTotalPrice()
                      }
                    });
                  }}
                >
                  Checkout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default RestaurantDetail;

