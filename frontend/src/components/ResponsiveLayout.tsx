import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate, useLocation } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import MyOrders from '../pages/MyOders/MyOrders';
import DeliveryStatus from '../pages/DeliveryStatus';
import MyProfile from '../pages/MyProfile';
import RestaurantDetail from '../pages/RestaurantDetail';
import Checkout from '../pages/Checkout';


interface ResponsiveLayoutProps {
  onLogout?: () => void;
}

function ResponsiveLayout({ onLogout }: ResponsiveLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const userRole = React.useMemo((): string | null => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Decoded token payload:', payload);
          if (payload.role) {
            return payload.role;
          }
        } catch (e) {
          console.warn('Failed to decode token:', e);
        }
      }
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          
          if (user.role) return user.role;
          if (user.userType) return user.userType;
        } catch (e) {
          console.warn('Failed to parse user:', e);
        }
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
    return null;
  }, []);

  const isDeliveryStaff = userRole === 'delivery';

  
  React.useEffect(() => {
    if (isDeliveryStaff && location.pathname === '/dashboard') {
      navigate('/dashboard/orders', { replace: true });
    }
  }, [isDeliveryStaff, location.pathname, navigate]);

  
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'light' || savedMode === 'dark') ? savedMode : 'dark';
  });


  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#6366f1',
          },
          ...(mode === 'dark'
            ? {
                background: {
                  default: '#0b1120',
                  paper: '#020617',
                },
              }
            : {
                background: {
                  default: '#f8fafc',
                  paper: '#ffffff',
                },
              }),
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
        shape: {
          borderRadius: 12,
        },
      }),
    [mode]
  );

  
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  
  const buildNavItems = () => {
    const items: Array<{
      type: 'header' | 'item' | 'divider';
      label?: string;
      icon?: React.ReactNode;
      path?: string;
      showForRoles?: string[];
    }> = [];

    
    if (userRole === 'customer' || userRole === 'restaurant') {
      items.push({ type: 'header', label: 'Restaurant' });
      items.push({
        type: 'item',
        label: 'Restaurants',
        icon: <RestaurantIcon />,
        path: '/dashboard',
      });
    }

    
    items.push({ type: 'header', label: 'Orders' });

    
    if (userRole === 'customer') {
      items.push({
        type: 'item',
        label: 'My Orders',
        icon: <ShoppingCartIcon />,
        path: '/dashboard/orders',
      });
      items.push({
        type: 'item',
        label: 'Order History',
        icon: <HistoryIcon />,
        path: '/dashboard/order-history',
      });
    }
    
    else if (userRole === 'delivery') {
      items.push({
        type: 'item',
        label: 'Orders',
        icon: <ShoppingCartIcon />,
        path: '/dashboard/orders',
      });
      items.push({
        type: 'item',
        label: 'Delivery Status',
        icon: <DeliveryDiningIcon />,
        path: '/dashboard/delivery',
      });
    }
    
    else if (userRole === 'restaurant') {
      items.push({
        type: 'item',
        label: 'Order Information',
        icon: <ShoppingCartIcon />,
        path: '/dashboard/order-information',
      });
      items.push({
        type: 'item',
        label: 'Order History',
        icon: <HistoryIcon />,
        path: '/dashboard/order-history',
      });
    }
    
    else {
      items.push({
        type: 'item',
        label: 'My Orders',
        icon: <ShoppingCartIcon />,
        path: '/dashboard/orders',
      });
      items.push({
        type: 'item',
        label: 'Order Information',
        icon: <ShoppingCartIcon />,
        path: '/dashboard/order-information',
      });
      items.push({
        type: 'item',
        label: 'Order History',
        icon: <HistoryIcon />,
        path: '/dashboard/order-history',
      });
    }

    
    items.push({ type: 'header', label: 'Settings' });
    items.push({
      type: 'item',
      label: 'My Profile',
      icon: <PersonIcon />,
      path: '/dashboard/profile',
    });

    
    items.push({ type: 'divider' });
    items.push({
      type: 'item',
      label: 'Logout',
      icon: <LogoutIcon />,
      path: '/logout',
    });

    return items;
  };

  const navItems = buildNavItems();

  const handleNavClick = async (item: (typeof navItems)[number]) => {
    if (item.type !== 'item') return;

    if (item.path === '/logout') {
      if (typeof onLogout === 'function') {
        try {
          await onLogout();
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
      navigate('/login', { replace: true });
      return;
    }

    if (item.path && location.pathname !== item.path) {
      navigate(item.path);
    }
  };

  
  const normalizedPath = location.pathname.replace(/\/$/, '');
  let content: React.ReactNode;
  switch (normalizedPath) {
    case '/dashboard':
      
      
      if (isDeliveryStaff) {
        content = <MyOrders />; 
      } else {
        content = <Dashboard />;
      }
      break;
    case '/dashboard/orders':
      content = <MyOrders />;
      break;
    case '/dashboard/order-history':
      
      if (userRole === 'delivery') {
        content = <MyOrders />;
      } else {
        
        content = <MyOrders />; 
      }
      break;
    case '/dashboard/order-information':
      
      if (userRole === 'delivery') {
        content = <MyOrders />;
      } else {
        
        content = <MyOrders />; 
      }
      break;
    case '/dashboard/delivery':
      content = <DeliveryStatus />;
      break;
    case '/dashboard/profile':
      content = <MyProfile />;
      break;
    case '/dashboard/restaurant':
      content = <RestaurantDetail />;
      break;
    case '/dashboard/checkout':
      content = <Checkout />;
      break;
    default:
      
      if (isDeliveryStaff) {
        content = <MyOrders />;
      } else {
        content = <Dashboard />;
      }
  }

  return (
<ThemeProvider theme={theme}>
  <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <RestaurantIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Food Ordering App
        </Typography>
        <IconButton
          onClick={toggleColorMode}
          color="inherit"
          aria-label="toggle theme"
          sx={{ ml: 1 }}
        >
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>

    <Drawer
      variant="permanent"
      sx={{
        width: 280, 
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280, 
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', p: 1 }}> 
        <List>
          {navItems.map((item, index) => {
            if (item.type === 'header') {
              return (
                <React.Fragment key={`header-${index}`}>
                  <ListItem>
                    <Typography
                      variant="caption"
                      sx={{ 
                        px: 2, 
                        pt: 1, 
                        pb: 0.5, 
                        color: 'text.secondary',
                        fontWeight: 'medium',
                        fontSize: '0.75rem',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </ListItem>
                </React.Fragment>
              );
            }

            if (item.type === 'divider') {
              return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
            }

            const selected =
              item.path !== '/logout' &&
              (normalizedPath === item.path ||
                (item.path === '/dashboard' && normalizedPath === '/dashboard'));

            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 1.5 }}> 
                <ListItemButton 
                  selected={selected} 
                  onClick={() => handleNavClick(item)}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: 'inherit',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: selected ? 'medium' : 'regular',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>

    <Box
      component="main"
      sx={{
        flexGrow: 1,
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 1, 
        ml: `28px`, 
        minHeight: '100vh',
      }}
    >
      <Toolbar />
      {content}
    </Box>
  </Box>
</ThemeProvider>
  );
}

ResponsiveLayout.propTypes = {
  onLogout: PropTypes.func,
};

export default ResponsiveLayout;

