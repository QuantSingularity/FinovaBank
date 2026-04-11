import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  type AuthResponse,
  type LoginCredentials,
  loginUser,
  logoutUser,
  type RegisterData,
  registerUser,
} from '../services/api';

interface AuthContextData {
  userToken: string | null;
  userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_STORAGE_KEY = 'finovabank_user_token';
const USER_DATA_STORAGE_KEY = 'finovabank_user_data';

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      setIsLoading(true);
      try {
        const [token, userDataString] = await Promise.all([
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(USER_DATA_STORAGE_KEY),
        ]);

        if (token) {
          setUserToken(token);
        }

        if (userDataString) {
          setUserData(JSON.parse(userDataString));
        }
      } catch (e) {
        console.error('Failed to restore authentication state', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const storeAuthData = useCallback(async (response: AuthResponse) => {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, response.token],
        [USER_DATA_STORAGE_KEY, JSON.stringify(response.user)],
      ]);
      setUserToken(response.token);
      setUserData(response.user);
    } catch (error) {
      console.error('Failed to store auth data', error);
      throw new Error('Failed to store authentication data');
    }
  }, []);

  const clearAuthData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_STORAGE_KEY,
        USER_DATA_STORAGE_KEY,
      ]);
      setUserToken(null);
      setUserData(null);
    } catch (error) {
      console.error('Failed to clear auth data', error);
      throw new Error('Failed to clear authentication data');
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const response = await loginUser(credentials);
        await storeAuthData(response.data);
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [storeAuthData],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (userToken) {
        await logoutUser();
      }
      await clearAuthData();
    } catch (error) {
      console.error('Logout failed:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, [userToken, clearAuthData]);

  const register = useCallback(
    async (newUserData: RegisterData) => {
      setIsLoading(true);
      try {
        const response = await registerUser(newUserData);
        await storeAuthData(response.data);
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [storeAuthData],
  );

  const authContextValue: AuthContextData = {
    userToken,
    userData,
    isLoading,
    isAuthenticated: !!userToken,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
