import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { backendApi } from '../services/api';

interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  restaurant?: string;
  restid?: number; // Add restid for restaurant items
  item_ID?: number; // Add item_ID for menu items from database
}

// Helper: get current user role from token or localStorage
const getCurrentUserRole = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role) return String(payload.role).toLowerCase();
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role) return String(user.role).toLowerCase();
      if (user.userType) return String(user.userType).toLowerCase();
    }
  } catch (error) {
    console.error('Error getting user role:', error);
  }
  return null;
};

// Helper: get restaurant name for restaurant user
const getCurrentRestaurantName = (): string => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.restname) return user.restname;
      if (user.restaurantName) return user.restaurantName;
      if (user.name) return user.name;
    }

    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.restname) return payload.restname;
      if (payload.name) return payload.name;
    }
  } catch (error) {
    console.error('Error getting restaurant name:', error);
  }
  return 'My Restaurant';
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [editFoodDialogOpen, setEditFoodDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [newFood, setNewFood] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });

  // Load basic user context (role + restaurant name) once on mount
  useEffect(() => {
    const role = getCurrentUserRole();
    setUserRole(role);

    if (role === 'restaurant') {
      const restName = getCurrentRestaurantName();
      setRestaurantName(restName);
    } else {
      setRestaurantName('');
    }
  }, []);

  // Load data whenever role or restaurant name changes
  useEffect(() => {
    const isRestaurant = userRole === 'restaurant';

    if (!userRole) {
      // Wait until we know the role
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        if (isRestaurant) {
          // For restaurant: show only their own menu items
          console.log('Loading menu items for restaurant...');
          const menuItems = await backendApi.getMyMenuItems();
          console.log('Menu items loaded:', menuItems);
          const restaurantFoods: FoodItem[] = menuItems.map(item => ({
            id: item.item_ID, // Use item_ID from database
            item_ID: item.item_ID,
            name: item.item_name,
            description: item.description || '',
            price: item.price,
            restaurant: restaurantName || 'My Restaurant',
            restid: item.restid
          }));
          setFoods(restaurantFoods);
          console.log('Restaurant foods set:', restaurantFoods);
        } else {
          // For customer: show all restaurants
          console.log('Loading restaurants for customer...');
          console.log('API base URL:', 'http://localhost:8080/api');
          console.log('Calling: GET /api/restaurants');
          
          const restaurants = await backendApi.getRestaurants();
          console.log('Restaurants loaded:', restaurants);
          console.log('Restaurants count:', restaurants?.length);
          
          if (!restaurants || restaurants.length === 0) {
            console.warn('No restaurants returned from API');
            setError('No restaurants found. Please check if the database has been initialized with restaurant data.');
            setFoods([]);
            return;
          }
          
          // Convert restaurants to FoodItem format for display
          const restaurantItems: FoodItem[] = restaurants.map(rest => {
            const item = {
              id: rest.restid,
              restid: rest.restid,
              name: rest.restname,
              description: rest.description || '',
              price: 0, // Not applicable for restaurants
              restaurant: rest.restname
            };
            console.log('Converting restaurant to FoodItem:', rest, '->', item);
            return item;
          });
          setFoods(restaurantItems);
          console.log('Restaurant items set:', restaurantItems);
          if (restaurantItems.length > 0) {
            console.log('First restaurant item check:', restaurantItems[0]?.restid, restaurantItems[0]?.restaurant);
          }
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
          baseURL: err.config?.baseURL,
          fullURL: err.config?.baseURL + err.config?.url
        });
        
        let errorMessage = isRestaurant ? 'Failed to load menu items' : 'Failed to load restaurants';
        
        // More specific error messages
        if (err.response?.status === 404) {
          errorMessage = `API endpoint not found (404). Please ensure:
1. The backend server is running on http://localhost:8080
2. The backend has been restarted after adding RestaurantController
3. The endpoint /api/restaurants exists`;
        } else if (err.message?.includes('Network Error') || !err.response) {
          errorMessage = `Cannot connect to server. Please ensure:
1. The backend is running on http://localhost:8080
2. Check the browser console for CORS errors
3. Try accessing http://localhost:8080/api/health in your browser`;
        } else if (err.response?.status === 500) {
          errorMessage = `Server error (500): ${err.response.data || 'Internal server error. Check backend logs.'}`;
        } else if (err.response?.data) {
          errorMessage = `${errorMessage}: ${typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)}`;
        } else if (err.message) {
          errorMessage = `${errorMessage}: ${err.message}`;
        }
        
        setError(errorMessage);
        setFoods([]); // Clear foods on error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userRole, restaurantName]);

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.restaurant?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFood = () => {
    if (!newFood.name || !newFood.description || !newFood.price) {
      alert('Please fill in all required fields (Name, Description, Price)');
      return;
    }

    const price = parseFloat(newFood.price);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const newFoodItem: FoodItem = {
      id: Date.now(), // Generate a unique ID
      name: newFood.name,
      description: newFood.description,
      price: price,
      image: newFood.image || undefined,
      restaurant: restaurantName || 'My Restaurant'
    };

    setFoods([...foods, newFoodItem]);
    setNewFood({ name: '', description: '', price: '', image: '' });
    setAddFoodDialogOpen(false);
  };

  const handleOpenAddDialog = () => {
    setNewFood({ name: '', description: '', price: '', image: '' });
    setAddFoodDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddFoodDialogOpen(false);
    setNewFood({ name: '', description: '', price: '', image: '' });
  };

  const handleOpenEditDialog = (food: FoodItem) => {
    setEditingFood(food);
    setNewFood({
      name: food.name,
      description: food.description,
      price: food.price.toString(),
      image: food.image || ''
    });
    setEditFoodDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditFoodDialogOpen(false);
    setEditingFood(null);
    setNewFood({ name: '', description: '', price: '', image: '' });
  };

  const handleUpdateFood = () => {
    if (!editingFood) return;

    if (!newFood.name || !newFood.description || !newFood.price) {
      alert('Please fill in all required fields (Name, Description, Price)');
      return;
    }

    const price = parseFloat(newFood.price);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const updatedFood: FoodItem = {
      ...editingFood,
      name: newFood.name,
      description: newFood.description,
      price: price,
      image: newFood.image || undefined
    };

    setFoods(foods.map(food => food.id === editingFood.id ? updatedFood : food));
    handleCloseEditDialog();
  };

  const handleDeleteFood = (foodId: number) => {
    if (window.confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      setFoods(foods.filter(food => food.id !== foodId));
    }
  };

  // Simple restaurant flag based on role
  const isRestaurant = userRole === 'restaurant';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestaurantIcon color="primary" />
        {isRestaurant ? `${restaurantName} - Menu Management` : 'Restaurants'}
      </Typography>

      {isRestaurant && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="body1">
            You are viewing your restaurant's menu. Only you can see and manage these items.
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder={isRestaurant ? "Search menu items..." : "Search foods, restaurants..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {isRestaurant && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            size="large"
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add New Menu Item
          </Button>
        )}
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
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Please check your connection and try refreshing the page.
          </Typography>
        </Paper>
      ) : filteredFoods.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {isRestaurant ? 'No menu items found. Add your first item to get started!' : 'No restaurants found'}
          </Typography>
          {!isRestaurant && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please ensure the database has been initialized with restaurant data.
            </Typography>
          )}
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
            <Card 
              key={food.id} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: !isRestaurant ? 'pointer' : 'default',
                '&:hover': !isRestaurant ? {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease-in-out'
                } : {}
              }}
              onClick={() => {
                console.log('Card clicked - isRestaurant:', isRestaurant);
                console.log('Card clicked - food:', food);
                console.log('Card clicked - food.restaurant:', food.restaurant);
                console.log('Card clicked - food.restid:', food.restid);
                
                if (!isRestaurant && food.restaurant && food.restid) {
                  console.log('Navigating to restaurant detail page:', {
                    restaurantName: food.restaurant,
                    restid: food.restid
                  });
                  navigate('/dashboard/restaurant', { 
                    state: { 
                      restaurantName: food.restaurant,
                      restid: food.restid
                    } 
                  });
                } else {
                  console.log('Click ignored - conditions not met:', {
                    isRestaurant,
                    hasRestaurant: !!food.restaurant,
                    hasRestid: !!food.restid
                  });
                }
              }}
            >
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
                {isRestaurant && (
                  <Typography variant="h6" color="primary">
                    ${food.price.toFixed(2)}
                  </Typography>
                )}
              </CardContent>
              {isRestaurant && (
                <CardActions sx={{ display: 'flex', gap: 1, px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDialog(food);
                    }}
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFood(food.id);
                    }}
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              )}
            </Card>
          ))}
        </Box>
      )}

      {/* Add New Food Dialog */}
      <Dialog open={addFoodDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            Add New Menu Item
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Item Name"
              fullWidth
              required
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., Har Gow"
            />
            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={3}
              value={newFood.description}
              onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., Shrimp dumplings"
            />
            <TextField
              label="Price"
              fullWidth
              required
              type="number"
              value={newFood.price}
              onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., 25.00"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
            <TextField
              label="Image URL (Optional)"
              fullWidth
              value={newFood.image}
              onChange={(e) => setNewFood({ ...newFood, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddFood}
            disabled={!newFood.name || !newFood.description || !newFood.price}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Food Dialog */}
      <Dialog open={editFoodDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            Edit Menu Item
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Item Name"
              fullWidth
              required
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., Har Gow"
            />
            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={3}
              value={newFood.description}
              onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., Shrimp dumplings"
            />
            <TextField
              label="Price"
              fullWidth
              required
              type="number"
              value={newFood.price}
              onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., 25.00"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
            <TextField
              label="Image URL (Optional)"
              fullWidth
              value={newFood.image}
              onChange={(e) => setNewFood({ ...newFood, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateFood}
            disabled={!newFood.name || !newFood.description || !newFood.price}
          >
            Update Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

