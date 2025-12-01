import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { FoodItem } from '../types/food';

interface FoodCardProps {
  food: FoodItem;
  isRestaurant: boolean;
  onEdit?: (food: FoodItem) => void;
  onDelete?: (foodId: number) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  isRestaurant,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    console.log('Card clicked - isRestaurant:', isRestaurant);
    console.log('Card clicked - food:', food);
    
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
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(food);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      onDelete(food.id);
    }
  };

  return (
    <Card 
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
      onClick={handleCardClick}
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
            onClick={handleEditClick}
            sx={{ flex: 1 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            sx={{ flex: 1 }}
          >
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default FoodCard;