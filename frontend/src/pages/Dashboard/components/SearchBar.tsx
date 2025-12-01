import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isRestaurant: boolean;
  onAddClick?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  isRestaurant,
  onAddClick,
  placeholder
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
      <TextField
        fullWidth
        placeholder={placeholder || (isRestaurant ? "Search menu items..." : "Search foods, restaurants...")}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {isRestaurant && onAddClick && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          size="large"
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add Menu Item
        </Button>
      )}
    </Box>
  );
};

export default SearchBar;