import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { NewFoodData } from '../types/food';

interface FoodFormDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  foodData: NewFoodData;
  onClose: () => void;
  onSubmit: () => void;
  onDataChange: (data: NewFoodData) => void;
  loading?: boolean;
}

const FoodFormDialog: React.FC<FoodFormDialogProps> = ({
  open,
  mode,
  foodData,
  onClose,
  onSubmit,
  onDataChange,
  loading = false
}) => {
  const isFormValid = foodData.name && foodData.description && foodData.price;

  const handleFieldChange = (field: keyof NewFoodData, value: string) => {
    onDataChange({
      ...foodData,
      [field]: value
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mode === 'add' ? <AddIcon color="primary" /> : <EditIcon color="primary" />}
          {mode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            label="Item Name"
            fullWidth
            required
            value={foodData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Har Gow"
            disabled={loading}
          />
          <TextField
            label="Description"
            fullWidth
            required
            multiline
            rows={3}
            value={foodData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Shrimp dumplings"
            disabled={loading}
          />
          <TextField
            label="Price"
            fullWidth
            required
            type="number"
            value={foodData.price}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., 25.00"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            disabled={loading}
          />
          <TextField
            label="Image URL (Optional)"
            fullWidth
            value={foodData.image}
            onChange={(e) => handleFieldChange('image', e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!isFormValid || loading}
        >
          {loading ? 'Saving...' : mode === 'add' ? 'Add Item' : 'Update Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FoodFormDialog;