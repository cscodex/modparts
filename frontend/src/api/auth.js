import api from './config';
import axios from 'axios';

export const login = async (email, password) => {
  try {
    console.log('Attempting login with:', { email, password });
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error response:', error.response);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    console.log('Attempting registration with:', userData);
    const response = await api.post('/auth/register', userData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error response:', error.response);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    console.log('Attempting logout');
    // For JWT-based auth, logout is handled client-side
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logout successful');
    return { message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Logout failed');
  }
};

export const updateUserProfile = async (userData) => {
  try {
    console.log('Updating user profile with:', userData);
    const response = await api.put('/users/profile', userData);
    console.log('Update profile response:', response.data);

    // Update the stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = { ...user, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error response:', error.response);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile');
    const response = await api.get('/users/profile');
    console.log('Get profile response:', response.data);

    // Update the stored user data with the latest from the server
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = { ...user, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    console.error('Error response:', error.response);
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};
