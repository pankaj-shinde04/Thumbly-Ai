import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest: React.FC = () => {
  const { user, isAuthenticated, login, signup, logout, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await signup(formData.name, formData.email, formData.password);
      setSuccess('Signup successful!');
      setFormData({ name: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await login(formData.email, formData.password);
      setSuccess('Login successful!');
      setFormData({ name: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    setError('');
    setSuccess('');
    
    try {
      await logout();
      setSuccess('Logout successful!');
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Authentication Test</h2>
      
      {user && (
        <div className="mb-6 p-4 bg-green-100 rounded-lg">
          <h3 className="font-semibold text-green-800">Logged in as:</h3>
          <p className="text-green-700">Name: {user.name}</p>
          <p className="text-green-700">Email: {user.email}</p>
          <p className="text-green-700">ID: {user._id}</p>
          <button
            onClick={handleLogout}
            className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}

      {!user && (
        <div>
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Signup</h3>
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Signup
              </button>
            </form>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Login</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>Backend URL: http://localhost:4000/api/v1</p>
        <p>Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
      </div>
    </div>
  );
};

export default AuthTest;
