import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Safe version of useAuth that doesn't throw errors during hot reloading
 * Returns null if context is not available instead of throwing
 */
export function useSafeAuth() {
  try {
    const context = useContext(AuthContext);
    return context;
  } catch (error) {
    console.warn('AuthContext not available:', error.message);
    return null;
  }
}

export default useSafeAuth;
