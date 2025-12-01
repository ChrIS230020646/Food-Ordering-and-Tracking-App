import React from 'react';
import { Box } from '@mui/material';
import { FoodItem } from '../types/food';
import FoodCard from './FoodCard';

interface FoodGridProps {
  foods: FoodItem[];
  isRestaurant: boolean;
  onEdit?: (food: FoodItem) => void;
  onDelete?: (foodId: number) => void;
}

const FoodGrid: React.FC<FoodGridProps> = ({
  foods,
  isRestaurant,
  onEdit,
  onDelete
}) => {
  return (
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
        <FoodCard
          key={food.id}
          food={food}
          isRestaurant={isRestaurant}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};

export default FoodGrid;