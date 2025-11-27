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
  Collapse,
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
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate, useLocation } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import MyOrders from '../pages/MyOrders';
import OrderHistory from '../pages/OrderHistory';
import DeliveryStatus from '../pages/DeliveryStatus';
import MyProfile from '../pages/MyProfile';
import OrderInformation from '../pages/OrderInformation';

const drawerWidth = 260;

interface ResponsiveLayoutProps {
  onLogout?: () => void;
}

function ResponsiveLayout({ onLogout }: ResponsiveLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user role from token or user object
  const userRole = React.useMemo((): string | null => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode JWT token (base64 decode the payload)
          const payload = JSON.parse(atob(token.split('.')[1]));
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
          // Check if user object has role or userType
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

  // Redirect delivery staff away from /dashboard (restaurant page)
  React.useEffect(() => {
    if (isDeliveryStaff && location.pathname === '/dashboard') {
      navigate('/dashboard/orders', { replace: true });
    }
  }, [isDeliveryStaff, location.pathname, navigate]);

  // Dark/Light mode state - load from localStorage or default to 'dark'
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'light' || savedMode === 'dark') ? savedMode : 'dark';
  });

  // Order Management expand/collapse state
  const [orderManagementOpen, setOrderManagementOpen] = React.useState(false);

  // Auto-expand Order Management if on delivery status page
  React.useEffect(() => {
    if (location.pathname === '/dashboard/delivery') {
      setOrderManagementOpen(true);
    }
  }, [location.pathname]);

  // Create theme based on mode
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

  // Toggle theme mode
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Build navigation items based on user role
  const buildNavItems = () => {
    const items: Array<{
      type: 'header' | 'item' | 'divider';
      label?: string;
      icon?: React.ReactNode;
      path?: string;
      showForRoles?: string[];
    }> = [];

    // Restaurant section - only for customer and restaurant
    if (userRole === 'customer' || userRole === 'restaurant') {
      items.push({ type: 'header', label: 'Restaurant' });
      items.push({
        type: 'item',
        label: 'Restaurants',
        icon: <RestaurantIcon />,
        path: '/dashboard',
      });
    }

    // Orders section
    items.push({ type: 'header', label: 'Orders' });

    // Customer: My Orders, Order Information, and Order History
    if (userRole === 'customer') {
      items.push({
        type: 'item',
        label: 'My Orders',
        icon: <ShoppingCartIcon />,
        path: '/dashboard/orders',
      });
      items.push({
        type: 'item',
        label: 'Order Information',
        icon: <InfoIcon />,
        path: '/dashboard/order-information',
      });
      items.push({
        type: 'item',
        label: 'Order History',
        icon: <HistoryIcon />,
        path: '/dashboard/order-history',
      });
    }
    // Delivery Staff: Order Management (with dropdown), Order Information, and Order History
    else if (userRole === 'delivery') {
      // Order Management will be added separately in the render
      items.push({
        type: 'item',
        label: 'Order Information',
        icon: <InfoIcon />,
        path: '/dashboard/order-information',
      });
      items.push({
        type: 'item',
        label: 'Order History',
        icon: <HistoryIcon />,
        path: '/dashboard/order-history',
      });
    }
    // Restaurant: Order Information and Order History
    else if (userRole === 'restaurant') {
      items.push({
        type: 'item',
        label: 'Order Information',
        icon: <InfoIcon />,
        path: '/dashboard/order-information',
      });
      items.push({
        type: 'item',
        label: 'Order History',
        icon: <HistoryIcon />,
        path: '/dashboard/order-history',
      });
    }
    // Default/Unknown role: show basic items
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
        icon: <InfoIcon />,
        path: '/dashboard/order-information',
      });
      items.push({
        type: 'item',
        label: 'Order History',
        icon: <HistoryIcon />,
        path: '/dashboard/order-history',
      });
    }

    // Settings section
    items.push({ type: 'header', label: 'Settings' });
    items.push({
      type: 'item',
      label: 'My Profile',
      icon: <PersonIcon />,
      path: '/dashboard/profile',
    });

    // Divider and Logout
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

  // Decide which page to render based on current path
  const normalizedPath = location.pathname.replace(/\/$/, '');
  let content: React.ReactNode;
  switch (normalizedPath) {
    case '/dashboard':
      // Only delivery staff should be redirected (handled in useEffect)
      // Customer and restaurant should see Dashboard
      if (isDeliveryStaff) {
        content = <MyOrders />; // Fallback in case redirect didn't work
      } else {
        content = <Dashboard />;
      }
      break;
    case '/dashboard/orders':
      content = <MyOrders />;
      break;
    case '/dashboard/order-history':
      content = <OrderHistory />;
      break;
    case '/dashboard/order-information':
      content = <OrderInformation />;
      break;
    case '/dashboard/delivery':
      content = <DeliveryStatus />;
      break;
    case '/dashboard/profile':
      content = <MyProfile />;
      break;
    default:
      // Default: show Dashboard for customer/restaurant, MyOrders for delivery
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
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              color: 'text.primary',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {navItems.map((item, index) => {
                if (item.type === 'header') {
                  const isOrdersHeader = item.label === 'Orders';
                  return (
                    <React.Fragment key={`header-${index}`}>
                      <ListItem>
                        <Typography
                          variant="caption"
                          sx={{ px: 2, pt: 1, pb: 0.5, color: 'text.secondary' }}
                        >
                          {item.label}
                        </Typography>
                      </ListItem>
                      {/* Order Management with dropdown - only for delivery staff, placed after Orders header */}
                      {isOrdersHeader && userRole === 'delivery' && (
                        <>
                          <ListItem disablePadding>
                            <ListItemButton
                              onClick={() => setOrderManagementOpen(!orderManagementOpen)}
                              selected={normalizedPath === '/dashboard/orders' || normalizedPath === '/dashboard/delivery'}
                            >
                              <ListItemIcon sx={{ color: 'inherit' }}>
                                <ShoppingCartIcon />
                              </ListItemIcon>
                              <ListItemText primary="Order Management" />
                              {orderManagementOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                          </ListItem>
                          <Collapse in={orderManagementOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              <ListItemButton
                                sx={{ pl: 4 }}
                                selected={normalizedPath === '/dashboard/orders'}
                                onClick={() => {
                                  if (location.pathname !== '/dashboard/orders') {
                                    navigate('/dashboard/orders');
                                  }
                                }}
                              >
                                <ListItemIcon sx={{ color: 'inherit' }}>
                                  <ShoppingCartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Orders" />
                              </ListItemButton>
                              <ListItemButton
                                sx={{ pl: 4 }}
                                selected={normalizedPath === '/dashboard/delivery'}
                                onClick={() => {
                                  if (location.pathname !== '/dashboard/delivery') {
                                    navigate('/dashboard/delivery');
                                  }
                                }}
                              >
                                <ListItemIcon sx={{ color: 'inherit' }}>
                                  <DeliveryDiningIcon />
                                </ListItemIcon>
                                <ListItemText primary="Delivery Status" />
                              </ListItemButton>
                            </List>
                          </Collapse>
                        </>
                      )}
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
                  <ListItem key={item.label} disablePadding>
                    <ListItemButton selected={selected} onClick={() => handleNavClick(item)}>
                      <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
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
            p: 3,
            ml: `${drawerWidth}px`,
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

