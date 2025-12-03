import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Restaurant as RestaurantIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { backendApi, RegisterData } from '../services/api';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterData>({
        username: '',
        email: '',
        phone: '',
        password: '',
        userType: 'customer',
        location: '',
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
        restname: '',
        description: '',
        address: '',
        cuisine: '',
        vehicleType: 'bike',
        licenseNumber: ''
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name as string]: value
        }));
        if (errors[name as string]) {
            setErrors(prev => ({
                ...prev,
                [name as string]: ''
            }));
        }
        if (registerError) setRegisterError('');
    };

    const handleSelectChange = (e: { target: { name: string; value: unknown } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        if (registerError) setRegisterError('');
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (errors.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name) newErrors.name = 'Full name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }

        if (formData.userType === 'customer') {
            if (!formData.addressLine1) newErrors.addressLine1 = 'Address line 1 is required';
        }

        if (formData.userType === 'restaurant') {
            if (!formData.restname) newErrors.restname = 'Restaurant name is required';
            if (!formData.address) newErrors.address = 'Address is required';
        }

        if (formData.userType === 'delivery') {
            if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        }

        return newErrors;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setRegisterError('');

        try {
            const response = await backendApi.register(formData);
            console.log('Registration successful:', response);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error: any) {
            console.error('Registration failed:', error);
            setRegisterError(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderRestaurantFields = () => {
        if (formData.userType !== 'restaurant') return null;
        
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    Restaurant Information
                </Typography>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="restname"
                    label="Restaurant Name"
                    name="restname"
                    value={formData.restname}
                    onChange={handleChange}
                    error={!!errors.restname}
                    helperText={errors.restname}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <RestaurantIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="description"
                    label="Description"
                    name="description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="address"
                    label="Restaurant Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <HomeIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="cuisine"
                    label="Cuisine Type"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                />
            </Box>
        );
    };

    const renderDeliveryFields = () => {
        if (formData.userType !== 'delivery') return null;
        
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    Delivery Information
                </Typography>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                    <Select
                        labelId="vehicle-type-label"
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        label="Vehicle Type"
                        onChange={handleSelectChange}
                    >
                        <MenuItem value="bike">Bike</MenuItem>
                        <MenuItem value="scooter">Scooter</MenuItem>
                        <MenuItem value="car">Car</MenuItem>
                        <MenuItem value="van">Van</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="licenseNumber"
                    label="License Number"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber}
                />
            </Box>
        );
    };

    const renderAddressFields = () => {
        if (formData.userType !== 'customer') return null;
        
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    Address Information
                </Typography>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="addressLine1"
                    label="Address Line 1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    error={!!errors.addressLine1}
                    helperText={errors.addressLine1}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <HomeIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="addressLine2"
                    label="Address Line 2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        margin="normal"
                        fullWidth
                        id="city"
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        sx={{ flex: 1 }}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="postalCode"
                        label="Postal Code"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        sx={{ flex: 1 }}
                    />
                </Box>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="country-label">Country/Region</InputLabel>
                    <Select
                        labelId="country-label"
                        id="country"
                        name="country"
                        value={formData.country || ''}
                        label="Country/Region"
                        onChange={handleSelectChange}
                    >
                        <MenuItem value="">Please select country/region</MenuItem>
                        <MenuItem value="Hong Kong">Hong Kong</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        );
    };

    return (
        <Container 
            component="main" 
            maxWidth="md" 
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 600,
                    borderRadius: 2
                }}
            >
                <Typography component="h1" variant="h4" gutterBottom color="primary">
                    Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sign up to get started
                </Typography>

                <Box component="form" onSubmit={handleRegister} sx={{ width: '100%' }}>
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Registration successful! Redirecting to login...
                        </Alert>
                    )}
                    {registerError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {registerError}
                        </Alert>
                    )}

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="user-type-label">User Type</InputLabel>
                    <Select
                        labelId="user-type-label"
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        label="User Type"
                        onChange={handleSelectChange}
                        >
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="restaurant">Restaurant</MenuItem>
                            <MenuItem value="delivery">Delivery Staff</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Full Name"
                        name="name"
                        autoFocus
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="phone"
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {renderRestaurantFields()}
                    {renderDeliveryFields()}

                    <Divider sx={{ my: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Account Security
                        </Typography>
                    </Divider>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle confirm password visibility"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {renderAddressFields()}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            'Register'
                        )}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                Sign in here
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;
