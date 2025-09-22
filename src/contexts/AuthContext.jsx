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
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      setInitializing(true);
      setLoading(true);
      
      try {
        // Check token expiration first
        const tokenValid = authAPI.checkTokenExpiration();
        
        if (tokenValid && authAPI.isAuthenticated()) {
          // Check if token needs refresh
          if (authAPI.shouldRefreshToken()) {
            try {
              console.log('Token needs refresh, refreshing...');
              await authAPI.refreshToken();
            } catch (refreshError) {
              console.warn('Token refresh failed:', refreshError.message);
              // If refresh fails, continue with existing token
            }
          }
          // Try to get current user, but handle potential JSON parse errors
          let userData = null;
          
          try {
            userData = authAPI.getCurrentUser();
          } catch (parseError) {
            console.warn('Failed to parse stored user data:', parseError.message);
            // Don't logout, just fetch user data from API
            userData = null;
          }
          
          // If we have valid user data, use it; otherwise fetch from API
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
                  updatedUser.phone = fetchedData.phone || updatedUser.phone;
                  updatedUser.company = fetchedData.company || updatedUser.company;
                  updatedUser.department = fetchedData.department || updatedUser.department;
                  updatedUser.position = fetchedData.position || updatedUser.position;
                  updatedUser.address = fetchedData.address || updatedUser.address;
                  updatedUser.bio = fetchedData.bio || updatedUser.bio;
                  // Use actual avatar from backend, fallback to generated avatar only if no avatar exists
                  console.log('AuthContext: Fetched avatar from API:', fetchedData.avatar);
                  console.log('AuthContext: Current user avatar:', updatedUser.avatar);
                  updatedUser.avatar = fetchedData.avatar || updatedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fetchedData.username || fetchedData.name || updatedUser.name)}&background=6366f1&color=ffffff`;
                  console.log('AuthContext: Final avatar URL:', updatedUser.avatar);
                  updatedUser.created_at = fetchedData.created_at || fetchedData.date_joined || updatedUser.created_at;
                  updatedUser.date_joined = fetchedData.date_joined || fetchedData.created_at || updatedUser.date_joined;
                }
                
                // Store updated user data
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
              }
            } catch (error) {
              console.warn('Token verification failed:', error.message);
              // Token might be expired, logout user
              await logout();
            }
          } else {
            // No stored user data, fetch from API
            try {
              const userDetails = await authAPI.getUserDetails();
              if (userDetails) {
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
                  const newUserData = {
                    id: fetchedData.id,
                    email: fetchedData.email,
                    name: fetchedData.username || fetchedData.name || fetchedData.email,
                    role: fetchedData.role || 'Admin',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fetchedData.username || fetchedData.name || fetchedData.email)}&background=6366f1&color=ffffff`
                  };
                  
                  // Store user data
                  localStorage.setItem('user', JSON.stringify(newUserData));
                  setUser(newUserData);
                  setIsAuthenticated(true);
                } else {
                  await logout();
                }
              } else {
                await logout();
              }
            } catch (error) {
              console.warn('Failed to fetch user details:', error.message);
              await logout();
            }
          }
        }
      } catch (error) {
        console.warn('Failed to initialize auth:', error.message);
        // Clear everything on error
        await logout();
      } finally {
        setInitializing(false);
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Set up periodic token expiration check and refresh (every 5 minutes)
    const tokenCheckInterval = setInterval(async () => {
      if (isAuthenticated) {
        const tokenValid = authAPI.checkTokenExpiration();
        if (!tokenValid) {
          // Token expired, logout user
          console.log('Token expired, logging out user');
          logout();
        } else if (authAPI.shouldRefreshToken()) {
          // Token needs refresh
          try {
            console.log('Auto-refreshing token...');
            await authAPI.refreshToken();
          } catch (refreshError) {
            console.warn('Auto token refresh failed:', refreshError.message);
            // If refresh fails, logout user
            logout();
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [isAuthenticated]);

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
        
        // Store the complete user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
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

  const updateUser = async (updatedUserData = null) => {
    try {
      // If updated user data is provided, use it directly
      if (updatedUserData) {
        console.log('AuthContext updateUser: Received updated user data:', updatedUserData);
        console.log('AuthContext updateUser: Updated avatar field:', updatedUserData.avatar);
        
        const userData = {
          id: updatedUserData.id || user?.id,
          email: updatedUserData.email || user?.email,
          name: updatedUserData.name || updatedUserData.username || user?.name,
          role: updatedUserData.role || updatedUserData.user_type || user?.role || 'User',
          phone: updatedUserData.phone || user?.phone,
          company: updatedUserData.company || user?.company,
          department: updatedUserData.department || user?.department,
          position: updatedUserData.position || user?.position,
          address: updatedUserData.address || user?.address,
          bio: updatedUserData.bio || user?.bio,
          avatar: updatedUserData.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUserData.name || updatedUserData.username || updatedUserData.email || 'User')}&background=6366f1&color=ffffff`,
          profile_image: updatedUserData.avatar || updatedUserData.profile_image || user?.profile_image,
          created_at: updatedUserData.created_at || updatedUserData.date_joined || user?.created_at || user?.date_joined,
          date_joined: updatedUserData.date_joined || updatedUserData.created_at || user?.date_joined || user?.created_at
        };
        
        console.log('AuthContext updateUser: Final user data with avatar:', userData.avatar);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return;
      }
      
      // Otherwise fetch from API
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
          phone: userDetails.user.phone,
          company: userDetails.user.company,
          department: userDetails.user.department,
          position: userDetails.user.position,
          address: userDetails.user.address,
          bio: userDetails.user.bio,
          avatar: userDetails.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.user.username || userDetails.user.name || userDetails.user.email)}&background=6366f1&color=ffffff`,
          created_at: userDetails.user.created_at || userDetails.user.date_joined,
          date_joined: userDetails.user.date_joined || userDetails.user.created_at
        };
      } else if (userDetails?.data?.user) {
        userData = {
          id: userDetails.data.user.id,
          email: userDetails.data.user.email,
          name: userDetails.data.user.username || userDetails.data.user.name || userDetails.data.user.email,
          role: userDetails.data.user.role || 'User',
          phone: userDetails.data.user.phone,
          company: userDetails.data.user.company,
          department: userDetails.data.user.department,
          position: userDetails.data.user.position,
          address: userDetails.data.user.address,
          bio: userDetails.data.user.bio,
          avatar: userDetails.data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.data.user.username || userDetails.data.user.name || userDetails.data.user.email)}&background=6366f1&color=ffffff`,
          created_at: userDetails.data.user.created_at || userDetails.data.user.date_joined,
          date_joined: userDetails.data.user.date_joined || userDetails.data.user.created_at
        };
      } else if (userDetails?.data) {
        userData = {
          id: userDetails.data.id,
          email: userDetails.data.email,
          name: userDetails.data.username || userDetails.data.name || userDetails.data.email,
          role: userDetails.data.role || 'User',
          phone: userDetails.data.phone,
          company: userDetails.data.company,
          department: userDetails.data.department,
          position: userDetails.data.position,
          address: userDetails.data.address,
          bio: userDetails.data.bio,
          avatar: userDetails.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.data.username || userDetails.data.name || userDetails.data.email)}&background=6366f1&color=ffffff`,
          created_at: userDetails.data.created_at || userDetails.data.date_joined,
          date_joined: userDetails.data.date_joined || userDetails.data.created_at
        };
      } else {
        userData = {
          id: userDetails.id,
          email: userDetails.email,
          name: userDetails.username || userDetails.name || userDetails.email,
          role: userDetails.role || 'User',
          phone: userDetails.phone,
          company: userDetails.company,
          department: userDetails.department,
          position: userDetails.position,
          address: userDetails.address,
          bio: userDetails.bio,
          avatar: userDetails.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.username || userDetails.name || userDetails.email)}&background=6366f1&color=ffffff`,
          created_at: userDetails.created_at || userDetails.date_joined,
          date_joined: userDetails.date_joined || userDetails.created_at
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
      initializing,
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
    console.error('useAuth called outside AuthProvider. Current context:', context);
    console.error('AuthContext:', AuthContext);
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;