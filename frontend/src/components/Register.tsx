import React, { useState } from 'react';
import { backendApi, RegisterData } from '../services/api';

const Register: React.FC = () => {
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        try {
            const response = await backendApi.register(formData);
            console.log('Registration successful:', response);
            alert('Registration successful!');
        } catch (error: any) {
            console.error('Registration failed:', error);
            alert('Registration failed: ' + (error.response?.data || error.message));
        }
    };

    const renderRestaurantFields = () => {
        if (formData.userType !== 'restaurant') return null;
        
        return (
            <>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Restaurant Name"
                        value={formData.restname}
                        onChange={(e) => setFormData({...formData, restname: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
                <div className="mb-4">
                    <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={3}
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cuisine Type"
                        value={formData.cuisine}
                        onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
            </>
        );
    };

    const renderDeliveryFields = () => {
        if (formData.userType !== 'delivery') return null;
        
        return (
            <>
                <div className="mb-4">
                    <select 
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                        <option value="car">Car</option>
                        <option value="van">Van</option>
                    </select>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="License Number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
            </>
        );
    };

    const renderAddressFields = () => {
        if (formData.userType !== 'customer') return null;
        
        return (
            <>
                <h4 className="text-lg font-semibold mt-6 mb-4">Address information</h4>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Address line 1 *"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Address line 2"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <input
                            type="text"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="postalCode"
                            value={formData.postalCode}
                            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <select 
                        value={formData.country || ''}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="">Please select country/region</option>
                        <option value="Hong Kong">Hong Kong</option>
                    </select>
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                <form onSubmit={handleRegister}>
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
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
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
                            type="text"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    
                    {/* <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Location"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div> */}

                    {renderRestaurantFields()}
                    {renderDeliveryFields()}
                    
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
                    
                    <div className="mb-6">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>

                    {renderAddressFields()}
                    
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;