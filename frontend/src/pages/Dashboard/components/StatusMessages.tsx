import React from 'react';
import {
  Paper,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Button,
  Fade,
  Slide,
  Grow,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Fastfood as FastfoodIcon,
  SearchOff as SearchOffIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  NoFood as NoFoodIcon,
  Store as StoreIcon
} from '@mui/icons-material';

interface StatusMessagesProps {
  loading: boolean;
  error: string;
  isEmpty: boolean;
  isRestaurant: boolean;
  onRetry?: () => void;
  searchTerm?: string;
}

const StatusMessages: React.FC<StatusMessagesProps> = ({
  loading,
  error,
  isEmpty,
  isRestaurant,
  onRetry,
  searchTerm = ''
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 動畫配置
  const animationProps = {
    in: true,
    timeout: 500,
    mountOnEnter: true,
    unmountOnExit: true
  };

  if (loading) {
    return (
      <Fade {...animationProps}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            p: 6,
            textAlign: 'center',
            minHeight: 300
          }}
        >
          <CircularProgress 
            size={isMobile ? 40 : 60} 
            thickness={4}
            sx={{ mb: 3, color: 'primary.main' }}
          />
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 1 }}
          >
            {isRestaurant ? 'Loading your menu...' : 'Discovering restaurants...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait a moment
          </Typography>
        </Box>
      </Fade>
    );
  }

  if (error) {
    return (
      <Slide direction="up" {...animationProps}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${theme.palette.error.light}`,
            background: `linear-gradient(135deg, ${theme.palette.error.light}15, transparent)`
          }}
        >
          <ErrorIcon 
            sx={{ 
              fontSize: isMobile ? 48 : 64, 
              color: 'error.main',
              mb: 2,
              opacity: 0.8
            }} 
          />
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              alignItems: 'center',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
            icon={<ErrorIcon />}
          >
            <Typography variant="h6" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              size={isMobile ? 'medium' : 'large'}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              size={isMobile ? 'medium' : 'large'}
            >
              Refresh Page
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            If the problem persists, please check your internet connection
          </Typography>
        </Paper>
      </Slide>
    );
  }

  if (isEmpty) {
    const hasSearchTerm = searchTerm.trim().length > 0;
    
    return (
      <Grow {...animationProps}>
        <Paper 
          elevation={1}
          sx={{ 
            p: { xs: 3, sm: 6 }, 
            textAlign: 'center',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.light}10, ${theme.palette.background.paper})`,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          {hasSearchTerm ? (
            // 搜索無結果狀態
            <>
              <SearchOffIcon 
                sx={{ 
                  fontSize: { xs: 56, sm: 72 },
                  color: 'text.secondary',
                  mb: 3,
                  opacity: 0.6
                }} 
              />
              <Typography 
                variant="h5" 
                color="text.secondary" 
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                No results found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We couldn't find any "{searchTerm}" in {isRestaurant ? 'your menu' : 'restaurants'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or browse all {isRestaurant ? 'menu items' : 'restaurants'}
              </Typography>
            </>
          ) : (
            // 空數據狀態
            <>
              {isRestaurant ? (
                <FastfoodIcon 
                  sx={{ 
                    fontSize: { xs: 56, sm: 72 },
                    color: 'primary.main',
                    mb: 3,
                    opacity: 0.8
                  }} 
                />
              ) : (
                <StoreIcon 
                  sx={{ 
                    fontSize: { xs: 56, sm: 72 },
                    color: 'primary.main',
                    mb: 3,
                    opacity: 0.8
                  }} 
                />
              )}
              
              <Typography 
                variant="h5" 
                color="text.primary" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                {isRestaurant ? 'Your menu is empty' : 'No restaurants available'}
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  maxWidth: 400,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                {isRestaurant 
                  ? 'Start by adding your first menu item to showcase your delicious offerings to customers.'
                  : 'Restaurants will appear here once they are registered in the system. Check back soon!'}
              </Typography>

              {isRestaurant && (
                <Box 
                  sx={{
                    p: 3,
                    bgcolor: 'primary.light',
                    borderRadius: 2,
                    maxWidth: 400,
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'primary.contrastText', fontWeight: 500 }}>
                    💡 Tip: Add high-quality photos and detailed descriptions to attract more customers
                  </Typography>
                </Box>
              )}

              {!isRestaurant && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    maxWidth: 400,
                    mx: 'auto',
                    borderRadius: 2
                  }}
                  icon={<RestaurantIcon />}
                >
                  <Typography variant="body2">
                    Looking for specific cuisine? Try using the search bar above
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </Paper>
      </Grow>
    );
  }

  return null;
};

export default StatusMessages;