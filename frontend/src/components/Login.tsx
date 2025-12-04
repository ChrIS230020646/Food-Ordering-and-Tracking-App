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
  VisibilityOff
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { backendApi, LoginData } from '../services/api';

interface LoginProps {
    onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginData>({
        email: '',
        password: '',
        userType: 'customer'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

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
        if (loginError) setLoginError('');
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
        if (loginError) setLoginError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: { [key: string]: string } = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setLoginError('');

        try {
            const response = await backendApi.login(formData);
            if (response.success) {
                console.log('Login successful:', response);
                // Store token/user info if provided
                if (response.token) {
                    localStorage.setItem('token', response.token);
                }
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
                // Call onLoginSuccess callback to update App state
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                setLoginError(response.message || 'Invalid email or password');
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            setLoginError(error.response?.data?.message || error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <Container 
            component="main" 
            maxWidth="sm" 
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
                    maxWidth: 400,
                    borderRadius: 2
                }}
            >
                <Typography component="h1" variant="h4" gutterBottom color="primary">
                    Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sign in to your account
                </Typography>

                <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                    {loginError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {loginError}
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
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
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
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
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
                                        onClick={handleTogglePassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

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
                            'Sign In'
                        )}
                    </Button>

                    <Divider sx={{ my: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            OR
                        </Typography>
                    </Divider>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                Register here
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;