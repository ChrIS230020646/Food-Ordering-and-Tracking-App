import React, { useState } from 'react';
import { backendApi, LoginData } from '../services/api';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
    const [formData, setFormData] = useState<LoginData>({
        email: '',
        password: '',
        userType: 'customer'
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await backendApi.login(formData);
            if (response.success) {
                console.log('Login successful:', response);
                alert('Login successful!');
                // 呢度可以將user嘅info save到localStorage或者其他
                // 跟住就自動幫個user跳到主頁面(帶user info)
            } else {
                alert('Login failed: ' + response.message);
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            alert('Login failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            User Type
                        </label>
                        <select 
                            value={formData.userType}
                            onChange={(e) => setFormData({...formData, userType: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="customer">Customer</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="delivery">Delivery Staff</option>
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 mb-4"
                    >
                        Login
                    </button>
                    
                    <div className="text-center">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link to="/register" className="text-blue-500 hover:text-blue-700">
                            Register here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;