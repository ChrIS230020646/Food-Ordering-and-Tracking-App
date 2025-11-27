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
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  restaurant?: string;
}

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

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');

  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info);
    
    if (info?.role === 'restaurant') {
      setRestaurantName(info.restname || 'My Restaurant');
    }
  }, []);

  useEffect(() => {
    const info = getUserInfo();
    const isRestaurant = info?.role === 'restaurant';
    
    if (isRestaurant) {
      // For restaurant: show only their own menu items
      // TODO: Fetch menu items from API for this restaurant
      const mockRestaurantFoods: FoodItem[] = [
        {
          id: 1,
          name: 'Har Gow',
          description: 'Shrimp dumplings',
          price: 25.00,
          restaurant: restaurantName || 'My Restaurant'
        },
        {
          id: 2,
          name: 'Siu Mai',
          description: 'Pork dumplings',
          price: 20.00,
          restaurant: restaurantName || 'My Restaurant'
        }
      ];
      setFoods(mockRestaurantFoods);
    } else {
      // For customer: show all restaurants and foods
      // TODO: Fetch foods from API
      const mockFoods: FoodItem[] = [
        {
          id: 1,
          name: 'Pizza Margherita',
          description: 'Classic Italian pizza with tomato, mozzarella, and basil',
          price: 12.99,
          restaurant: 'Italian Bistro'
        },
        {
          id: 2,
          name: 'Burger Deluxe',
          description: 'Juicy beef burger with cheese, lettuce, and special sauce',
          price: 9.99,
          restaurant: 'Burger House'
        },
        {
          id: 3,
          name: 'Sushi Platter',
          description: 'Assorted fresh sushi with soy sauce and wasabi',
          price: 24.99,
          restaurant: 'Sushi Master'
        },
        {
          id: 4,
          name: 'Pad Thai',
          description: 'Traditional Thai stir-fried noodles with shrimp',
          price: 13.99,
          restaurant: 'Thai Garden'
        }
      ];
      setFoods(mockFoods);
    }
  }, [restaurantName, userInfo]);

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.restaurant?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (food: FoodItem) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', food);
    alert(`Added ${food.name} to cart!`);
  };

  const isRestaurant = userInfo?.role === 'restaurant';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestaurantIcon color="primary" />
        {isRestaurant ? `${restaurantName} - Menu Management` : 'Food Menu'}
      </Typography>

      {isRestaurant && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="body1">
            You are viewing your restaurant's menu. Only you can see and manage these items.
          </Typography>
        </Paper>
      )}

      <TextField
        fullWidth
        placeholder={isRestaurant ? "Search menu items..." : "Search foods, restaurants..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredFoods.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {isRestaurant ? 'No menu items found. Add your first item to get started!' : 'No foods found'}
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
          {filteredFoods.map((food) => (
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
                {!isRestaurant && food.restaurant && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {food.restaurant}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {food.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${food.price.toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                {isRestaurant ? (
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      // TODO: Implement edit menu item functionality
                      console.log('Edit menu item:', food);
                      alert(`Edit ${food.name} - Coming soon!`);
                    }}
                  >
                    Edit Item
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(food)}
                    fullWidth
                  >
                    Add to Cart
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;

