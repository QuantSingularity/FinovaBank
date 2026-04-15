/**
 * API Service — FinovaBank
 * Uses expo-secure-store instead of AsyncStorage for the auth token
 * so credentials are stored in the OS keychain / encrypted storage.
 */
import * as SecureStore from "expo-secure-store";
import axios, { AxiosError } from "axios";
import Config from "./config";

const TOKEN_KEY = "finovabank_user_token";

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: Config.API_TIMEOUT,
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      if (Config.ENABLE_LOGGING) {
        console.warn("[API] Failed to read auth token:", error);
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor: handle 401 / network errors ────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync("finovabank_user_data");
      } catch (e) {
        if (Config.ENABLE_LOGGING)
          console.warn("[API] Failed to clear token:", e);
      }
    } else if (!error.response) {
      if (Config.ENABLE_LOGGING)
        console.warn("[API] Network error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────
export type ApiRecord = Record<string, unknown>;

// ── Account Management ────────────────────────────────────────────────────
export const createAccount = (data: ApiRecord) =>
  apiClient.post("/accounts", data);

export const getAccountDetails = (accountId: string) =>
  apiClient.get(`/accounts/${accountId}`);

export const updateAccountDetails = (accountId: string, data: ApiRecord) =>
  apiClient.put(`/accounts/${accountId}`, data);

export const getUserAccounts = () => apiClient.get("/accounts");

// ── Transaction Service ───────────────────────────────────────────────────
export const createTransaction = (data: ApiRecord) =>
  apiClient.post("/transactions", data);

export const getTransactionDetails = (transactionId: string) =>
  apiClient.get(`/transactions/${transactionId}`);

export const getAccountTransactions = (
  accountId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }
) => apiClient.get(`/accounts/${accountId}/transactions`, { params });

// ── Loan Management ───────────────────────────────────────────────────────
export const applyForLoan = (data: ApiRecord) => apiClient.post("/loans", data);

export const getLoanDetails = (loanId: string) =>
  apiClient.get(`/loans/${loanId}`);

export const getAccountLoans = (accountId: string) =>
  apiClient.get(`/accounts/${accountId}/loans`);

export const getLoanTypes = () => apiClient.get("/loans/types");

export const calculateLoanPayment = (data: {
  amount: number;
  term: number;
  rate: number;
}) => apiClient.post("/loans/calculate", data);

// ── Savings Goals ─────────────────────────────────────────────────────────
export const createSavingsGoal = (data: ApiRecord) =>
  apiClient.post("/savings", data);

export const getAccountSavingsGoals = (accountId: string) =>
  apiClient.get(`/accounts/${accountId}/savings`);

export const updateSavingsGoal = (goalId: string, data: ApiRecord) =>
  apiClient.put(`/savings/${goalId}`, data);

export const deleteSavingsGoal = (goalId: string) =>
  apiClient.delete(`/savings/${goalId}`);

// Bug fix: was "contributeTosavingsGoal" — corrected casing
export const contributeToSavingsGoal = (
  goalId: string,
  data: { amount: number }
) => apiClient.post(`/savings/${goalId}/contribute`, data);

// ── Authentication ────────────────────────────────────────────────────────
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const loginUser = (credentials: LoginCredentials) =>
  apiClient.post<AuthResponse>("/auth/login", credentials);

export const registerUser = (userData: RegisterData) =>
  apiClient.post<AuthResponse>("/auth/register", userData);

export const logoutUser = () => apiClient.post("/auth/logout");

export const resetPassword = (email: string) =>
  apiClient.post("/auth/reset-password", { email });

export const verifyEmail = (token: string) =>
  apiClient.post(`/auth/verify-email/${token}`);

// ── User Profile ──────────────────────────────────────────────────────────
export const getUserProfile = () => apiClient.get("/users/profile");

export const updateUserProfile = (data: ApiRecord) =>
  apiClient.put("/users/profile", data);

export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => apiClient.post("/users/change-password", data);

export default apiClient;
