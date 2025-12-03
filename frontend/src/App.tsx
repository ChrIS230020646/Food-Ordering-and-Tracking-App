import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { NotFound } from './pages/NotFound'
import BackendTest from './components/BackendTest'
import Register from './components/Register'
import Login from './components/Login';
import ResponsiveLayout from './components/ResponsiveLayout';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (check localStorage or token)
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!(token || user));
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {isLoggedIn ? (
            <>
              <Route path="/dashboard" element={<ResponsiveLayout onLogout={handleLogout} />} />
              <Route path="/dashboard/*" element={<ResponsiveLayout onLogout={handleLogout} />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route index element={<Login onLoginSuccess={handleLoginSuccess} />}/>
              <Route path="/backend-test" element={<BackendTest/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />}/>
              <Route path="*" element={<NotFound/>}/>
            </>
          )}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
