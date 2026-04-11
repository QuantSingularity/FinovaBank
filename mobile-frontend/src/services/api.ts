import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {AxiosError} from 'axios';
import Config from './config';

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: Config.API_TIMEOUT,
});

const TOKEN_STORAGE_KEY = 'finovabank_user_token';

apiClient.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get token from storage:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401) {
        try {
          await AsyncStorage.multiRemove([
            TOKEN_STORAGE_KEY,
            'finovabank_user_data',
          ]);
        } catch (e) {
          console.error('Failed to clear token:', e);
        }
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  },
);

// --- Account Management Service ---
export const createAccount = (data: Record<string, unknown>) =>
  apiClient.post('/accounts', data);
export const getAccountDetails = (accountId: string) =>
  apiClient.get(`/accounts/${accountId}`);
export const updateAccountDetails = (
  accountId: string,
  data: Record<string, unknown>,
) => apiClient.put(`/accounts/${accountId}`, data);
export const getUserAccounts = () => apiClient.get('/accounts');

// --- Transaction Service ---
export const createTransaction = (data: Record<string, unknown>) =>
  apiClient.post('/transactions', data);
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
  },
) => apiClient.get(`/accounts/${accountId}/transactions`, {params});

// --- Loan Management Service ---
export const applyForLoan = (data: Record<string, unknown>) =>
  apiClient.post('/loans', data);
export const getLoanDetails = (loanId: string) =>
  apiClient.get(`/loans/${loanId}`);
export const getAccountLoans = (accountId: string) =>
  apiClient.get(`/accounts/${accountId}/loans`);
export const getLoanTypes = () => apiClient.get('/loans/types');
export const calculateLoanPayment = (data: {
  amount: number;
  term: number;
  rate: number;
}) => apiClient.post('/loans/calculate', data);

// --- Savings Goals Service ---
export const createSavingsGoal = (data: Record<string, unknown>) =>
  apiClient.post('/savings', data);
export const getAccountSavingsGoals = (accountId: string) =>
  apiClient.get(`/accounts/${accountId}/savings`);
export const updateSavingsGoal = (
  goalId: string,
  data: Record<string, unknown>,
) => apiClient.put(`/savings/${goalId}`, data);
export const deleteSavingsGoal = (goalId: string) =>
  apiClient.delete(`/savings/${goalId}`);
export const contributeTosavingsGoal = (
  goalId: string,
  data: {amount: number},
) => apiClient.post(`/savings/${goalId}/contribute`, data);

// --- Authentication ---
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
  apiClient.post<AuthResponse>('/auth/login', credentials);

export const registerUser = (userData: RegisterData) =>
  apiClient.post<AuthResponse>('/auth/register', userData);

export const logoutUser = () => apiClient.post('/auth/logout');
export const resetPassword = (email: string) =>
  apiClient.post('/auth/reset-password', {email});
export const verifyEmail = (token: string) =>
  apiClient.post(`/auth/verify-email/${token}`);

// --- User Profile ---
export const getUserProfile = () => apiClient.get('/users/profile');
export const updateUserProfile = (data: Record<string, unknown>) =>
  apiClient.put('/users/profile', data);
export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => apiClient.post('/users/change-password', data);

export default apiClient;
