export const getCurrentUserRole = (): string | null => {
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

export const getCurrentRestaurantName = (): string => {
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