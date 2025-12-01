import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';
import { backendApi } from '../../services/api';


import SearchBar from './components/SearchBar';
import FoodGrid from './components/FoodGrid';
import FoodFormDialog from './components/FoodFormDialog';
import StatusMessages from './components/StatusMessages';


import { FoodItem, NewFoodData } from './types/food';
import { getCurrentUserRole, getCurrentRestaurantName } from './utils/userHelpers';

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [editFoodDialogOpen, setEditFoodDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [newFood, setNewFood] = useState<NewFoodData>({
    name: '',
    description: '',
    price: '',
    image: ''
  });

  
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

  
  useEffect(() => {
    const isRestaurant = userRole === 'restaurant';

    if (!userRole) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        if (isRestaurant) {
          console.log('Loading menu items for restaurant...');
          const menuItems = await backendApi.getMyMenuItems();
          console.log('Menu items loaded:', menuItems);
          const restaurantFoods: FoodItem[] = menuItems.map(item => ({
            id: item.item_ID,
            item_ID: item.item_ID,
            name: item.item_name,
            description: item.description || '',
            price: item.price,
            restaurant: restaurantName || 'My Restaurant',
            restid: item.restid
          }));
          setFoods(restaurantFoods);
        } else {
          console.log('Loading restaurants for customer...');
          const restaurants = await backendApi.getRestaurants();
          console.log('Restaurants loaded:', restaurants);
          
          if (!restaurants || restaurants.length === 0) {
            console.warn('No restaurants returned from API');
            setError('No restaurants found. Please check if the database has been initialized with restaurant data.');
            setFoods([]);
            return;
          }
          
          const restaurantItems: FoodItem[] = restaurants.map(rest => ({
            id: rest.restid,
            restid: rest.restid,
            name: rest.restname,
            description: rest.description || '',
            price: 0,
            restaurant: rest.restname
          }));
          setFoods(restaurantItems);
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        let errorMessage = isRestaurant ? 'Failed to load menu items' : 'Failed to load restaurants';
        
        if (err.response?.status === 404) {
          errorMessage = `API endpoint not found (404). Please ensure the backend server is running.`;
        } else if (err.message?.includes('Network Error') || !err.response) {
          errorMessage = `Cannot connect to server. Please ensure the backend is running.`;
        } else if (err.response?.status === 500) {
          errorMessage = `Server error (500): ${err.response.data || 'Internal server error.'}`;
        } else if (err.response?.data) {
          errorMessage = `${errorMessage}: ${typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)}`;
        } else if (err.message) {
          errorMessage = `${errorMessage}: ${err.message}`;
        }
        
        setError(errorMessage);
        setFoods([]);
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

  const isRestaurant = userRole === 'restaurant';

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
      id: Date.now(),
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
    setEditFoodDialogOpen(false);
    setEditingFood(null);
    setNewFood({ name: '', description: '', price: '', image: '' });
  };

  const handleDeleteFood = (foodId: number) => {
    setFoods(foods.filter(food => food.id !== foodId));
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isRestaurant={isRestaurant}
        onAddClick={handleOpenAddDialog}
      />

      <StatusMessages
        loading={loading}
        error={error}
        isEmpty={filteredFoods.length === 0}
        isRestaurant={isRestaurant}
      />

      {!loading && !error && filteredFoods.length > 0 && (
        <FoodGrid
          foods={filteredFoods}
          isRestaurant={isRestaurant}
          onEdit={handleOpenEditDialog}
          onDelete={handleDeleteFood}
        />
      )}

      {/* Add Food Dialog */}
      <FoodFormDialog
        open={addFoodDialogOpen}
        mode="add"
        foodData={newFood}
        onClose={handleCloseAddDialog}
        onSubmit={handleAddFood}
        onDataChange={setNewFood}
      />

      {/* Edit Food Dialog */}
      <FoodFormDialog
        open={editFoodDialogOpen}
        mode="edit"
        foodData={newFood}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdateFood}
        onDataChange={setNewFood}
      />
    </Box>
  );
};

export default Dashboard;