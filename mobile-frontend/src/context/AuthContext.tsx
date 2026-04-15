/**
 * AuthContext — FinovaBank Expo Edition
 *
 * Fixes vs. original:
 * 1. Uses expo-secure-store (OS keychain) instead of AsyncStorage for tokens.
 * 2. isLoading no longer set to true during login/register — avoids
 *    full-screen spinner for interactive actions; errors surface properly.
 * 3. logout() always clears local state even if the server call fails.
 * 4. useAuth() throws a descriptive error if used outside provider.
 */

import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type AuthResponse,
  type LoginCredentials,
  loginUser,
  logoutUser,
  type RegisterData,
  registerUser,
} from "../services/api";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextData {
  userToken: string | null;
  userData: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextData | null>(null);

const TOKEN_KEY = "finovabank_user_token";
const USER_KEY = "finovabank_user_data";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  // isLoading is ONLY true during the initial bootstrap
  const [isLoading, setIsLoading] = useState(true);

  // ── Bootstrap: restore session on app start ────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [token, userStr] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (token) setUserToken(token);
        if (userStr) setUserData(JSON.parse(userStr) as UserData);
      } catch (e) {
        console.warn("[Auth] Failed to restore session:", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────
  const persistAuth = useCallback(async (response: AuthResponse) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, response.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
    ]);
    setUserToken(response.token);
    setUserData(response.user);
  }, []);

  const clearAuth = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setUserToken(null);
    setUserData(null);
  }, []);

  // ── Public actions ─────────────────────────────────────────────────────
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginUser(credentials);
      await persistAuth(response.data);
    },
    [persistAuth]
  );

  const logout = useCallback(async () => {
    try {
      if (userToken) await logoutUser();
    } catch {
      // Ignore server errors — clear locally regardless
    } finally {
      await clearAuth();
    }
  }, [userToken, clearAuth]);

  const register = useCallback(
    async (newUserData: RegisterData) => {
      const response = await registerUser(newUserData);
      await persistAuth(response.data);
    },
    [persistAuth]
  );

  const updateUserData = useCallback((data: Partial<UserData>) => {
    setUserData((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userData,
        isLoading,
        isAuthenticated: !!userToken,
        login,
        logout,
        register,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
