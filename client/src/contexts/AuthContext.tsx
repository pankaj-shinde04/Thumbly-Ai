import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const API_BASE_URL = 'http://localhost:4001/api/v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh access token using refresh token
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('thumbly_refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('thumbly_access_token', data.data.accessToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  // Check for stored token and validate on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[Auth] Initializing authentication...');
      const token = localStorage.getItem('thumbly_access_token');
      const refreshToken = localStorage.getItem('thumbly_refresh_token');
      
      console.log('[Auth] Access token exists:', !!token);
      console.log('[Auth] Refresh token exists:', !!refreshToken);
      
      if (token) {
        try {
          console.log('[Auth] Validating access token...');
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('[Auth] /auth/me response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('[Auth] User data received:', data.data.user);
            setUser(data.data.user);
            console.log('[Auth] Authentication successful');
          } else if (response.status === 401) {
            console.log('[Auth] Access token expired, attempting refresh...');
            // Token expired, try to refresh
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              console.log('[Auth] Token refresh successful');
              // Retry with new token
              const newToken = localStorage.getItem('thumbly_access_token');
              const retryResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json'
                }
              });

              console.log('[Auth] Retry response status:', retryResponse.status);

              if (retryResponse.ok) {
                const data = await retryResponse.json();
                console.log('[Auth] User data received after refresh:', data.data.user);
                setUser(data.data.user);
                console.log('[Auth] Authentication successful after refresh');
              } else {
                console.log('[Auth] Refresh failed, clearing tokens');
                // Refresh failed, clear tokens
                localStorage.removeItem('thumbly_access_token');
                localStorage.removeItem('thumbly_refresh_token');
              }
            } else {
              console.log('[Auth] Token refresh failed, clearing tokens');
              // Token invalid, remove it
              localStorage.removeItem('thumbly_access_token');
              localStorage.removeItem('thumbly_refresh_token');
            }
          } else {
            console.log('[Auth] Other error, clearing tokens');
            // Other error, remove tokens
            localStorage.removeItem('thumbly_access_token');
            localStorage.removeItem('thumbly_refresh_token');
          }
        } catch (error) {
          console.error('[Auth] Auth validation error:', error);
          localStorage.removeItem('thumbly_access_token');
          localStorage.removeItem('thumbly_refresh_token');
        }
      } else {
        console.log('[Auth] No access token found');
      }
      
      console.log('[Auth] Authentication initialization complete');
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      // Store tokens and user
      localStorage.setItem('thumbly_access_token', data.data.accessToken);
      localStorage.setItem('thumbly_refresh_token', data.data.refreshToken);
      setUser(data.data.user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Signup failed');
      }

      // Store tokens and user
      localStorage.setItem('thumbly_access_token', data.data.accessToken);
      localStorage.setItem('thumbly_refresh_token', data.data.refreshToken);
      setUser(data.data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('thumbly_access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem('thumbly_access_token');
      localStorage.removeItem('thumbly_refresh_token');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
