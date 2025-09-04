import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authAPI } from '../api/authService';

const AuthContext = createContext(null);

// Simple JWT decoder function (inline)
function decodeJWTPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          // Try to get current user, but handle potential JSON parse errors
          let userData = null;
          
          try {
            userData = authAPI.getCurrentUser();
          } catch (parseError) {
            console.warn('Failed to parse stored user data:', parseError.message);
            // Clear invalid stored data
            await logout();
            return;
          }
          
          // Only proceed if we have valid user data
          if (userData && userData.id) {
            setUser(userData);
            setIsAuthenticated(true);
            
            // Optionally verify token with backend
            try {
              const userDetails = await authAPI.getUserDetails();
              if (userDetails) {
                // Update user with fresh data
                const updatedUser = { ...userData };
                
                let fetchedData;
                if (userDetails?.user) {
                  fetchedData = userDetails.user;
                } else if (userDetails?.data?.user) {
                  fetchedData = userDetails.data.user;
                } else if (userDetails?.data) {
                  fetchedData = userDetails.data;
                } else {
                  fetchedData = userDetails;
                }
                
                if (fetchedData && typeof fetchedData === 'object') {
                  updatedUser.id = fetchedData.id || updatedUser.id;
                  updatedUser.email = fetchedData.email || updatedUser.email;
                  updatedUser.name = fetchedData.username || fetchedData.name || updatedUser.name;
                  updatedUser.role = fetchedData.role || updatedUser.role;
                  updatedUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fetchedData.username || fetchedData.name || updatedUser.name)}&background=6366f1&color=ffffff`;
                }
                
                setUser(updatedUser);
              }
            } catch (error) {
              console.warn('Token verification failed:', error.message);
              // Token might be expired, logout user
              await logout();
            }
          } else {
            // No valid user data, clear everything
            await logout();
          }
        }
      } catch (error) {
        console.warn('Failed to initialize auth:', error.message);
        // Clear everything on error
        await logout();
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      
      // Debug: Log the response to understand its structure
      console.log('Login response:', response);
      
      // Your API returns only tokens: { access: "token", refresh: "token" }
      if (response?.access) {
        // Try to extract user info from JWT token
        const tokenPayload = decodeJWTPayload(response.access);
        console.log('Token payload:', tokenPayload);
        
        // Create user object with available information
        const userData = {
          id: tokenPayload?.user_id || tokenPayload?.sub || tokenPayload?.id || null,
          email: tokenPayload?.email || email, // Fallback to login email
          name: tokenPayload?.username || tokenPayload?.name || tokenPayload?.email?.split('@')[0] || email.split('@')[0],
          role: tokenPayload?.role || 'Admin', // Default role if not provided
          avatar: null // Will be set below
        };

        // Generate avatar URL
        const displayName = userData.name || userData.email;
        userData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=ffffff`;

        // Try to fetch additional user details if getUserDetails endpoint exists
        try {
          const userDetails = await authAPI.getUserDetails();
          console.log('User details response:', userDetails);
          
          // Update userData with fetched details if available
          if (userDetails) {
            // Handle different possible response structures for user details
            let fetchedData;
            
            if (userDetails?.user) {
              fetchedData = userDetails.user;
            } else if (userDetails?.data?.user) {
              fetchedData = userDetails.data.user;
            } else if (userDetails?.data) {
              fetchedData = userDetails.data;
            } else {
              fetchedData = userDetails;
            }
            
            // Update user data with fetched information
            if (fetchedData && typeof fetchedData === 'object') {
              userData.id = fetchedData.id || userData.id;
              userData.email = fetchedData.email || userData.email;
              userData.name = fetchedData.username || fetchedData.name || userData.name;
              userData.role = fetchedData.role || userData.role;
              userData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fetchedData.username || fetchedData.name || userData.name)}&background=6366f1&color=ffffff`;
            }
          }
        } catch (userError) {
          console.warn('Could not fetch additional user details:', userError.message);
          // Continue with token-based user data - this is not a critical error
        }
        
        console.log('Final user data:', userData);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { ...response, user: userData };
      } else {
        throw new Error('Invalid login response: missing access token');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      console.log('Register response:', response); // Debug log
      return response;
    } catch (error) {
      console.error('Register error:', error);
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, otp) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.verifyOTP(email, otp);
      console.log('OTP verification response:', response); // Debug log
      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'OTP verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.requestPasswordReset(email);
      console.log('Password reset response:', response); // Debug log
      return response;
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPassword = async (token, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.confirmPasswordReset(token, newPassword);
      console.log('Password verify response:', response); // Debug log
      return response;
    } catch (error) {
      console.error('Password verification error:', error);
      setError(error.message || 'Password verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = async () => {
    try {
      const userDetails = await authAPI.getUserDetails();
      console.log('User details response:', userDetails); // Debug log
      
      // Handle different response structures for user details as well
      let userData;
      if (userDetails?.user) {
        userData = {
          id: userDetails.user.id,
          email: userDetails.user.email,
          name: userDetails.user.username || userDetails.user.name || userDetails.user.email,
          role: userDetails.user.role || 'User',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.user.username || userDetails.user.name || userDetails.user.email)}&background=6366f1&color=ffffff`
        };
      } else if (userDetails?.data?.user) {
        userData = {
          id: userDetails.data.user.id,
          email: userDetails.data.user.email,
          name: userDetails.data.user.username || userDetails.data.user.name || userDetails.data.user.email,
          role: userDetails.data.user.role || 'User',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.data.user.username || userDetails.data.user.name || userDetails.data.user.email)}&background=6366f1&color=ffffff`
        };
      } else if (userDetails?.data) {
        userData = {
          id: userDetails.data.id,
          email: userDetails.data.email,
          name: userDetails.data.username || userDetails.data.name || userDetails.data.email,
          role: userDetails.data.role || 'User',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.data.username || userDetails.data.name || userDetails.data.email)}&background=6366f1&color=ffffff`
        };
      } else {
        userData = {
          id: userDetails.id,
          email: userDetails.email,
          name: userDetails.username || userDetails.name || userDetails.email,
          role: userDetails.role || 'User',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.username || userDetails.name || userDetails.email)}&background=6366f1&color=ffffff`
        };
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to update user details:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      // Existing props (maintaining compatibility)
      isAuthenticated,
      user,
      login,
      logout,
      resetPassword,
      verifyPassword,
      
      // Additional props for enhanced functionality
      loading,
      error,
      register,
      verifyOTP,
      clearError,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;