import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface Account {
  accountId: string;
  accountType: "CHECKING" | "SAVINGS" | "CREDIT" | "LOAN" | string;
  balance: number;
  currency: string;
  createdAt: string;
  name?: string;
  email?: string;
}

export interface Transaction {
  transactionId: string;
  accountId: string;
  transactionType: "CREDIT" | "DEBIT" | "TRANSFER";
  amount: number;
  description: string;
  category?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  date: string;
  referenceNumber?: string;
  currency: string;
}

export interface Loan {
  loanId: string;
  loanAmount: number;
  loanType: string;
  interestRate: number;
  durationInMonths: number;
  monthlyPayment: number;
  remainingAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  approvalDate?: string;
  nextPaymentDate?: string;
}

export interface SavingsGoal {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
  description?: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface Report {
  reportId: string;
  accountId?: string;
  customerId?: string;
  reportType: string;
  details?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  filePath?: string;
  generatedAt: string;
  requestedBy?: string;
}

export interface CreateAccountData {
  accountType: string;
  currency: string;
}

export interface CreateTransactionData {
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: number;
  description: string;
  accountId: string;
  destinationAccountId?: string;
}

export interface CreateLoanData {
  loanAmount: number;
  loanType: string;
  durationInMonths: number;
}

export interface CreateSavingsGoalData {
  goalName: string;
  targetAmount: number;
  targetDate: string;
  description?: string;
}

export interface CreateReportData {
  reportType: string;
  accountId?: string;
  customerId?: string;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const accountAPI = {
  getAccounts: () => api.get<Account[]>("/accounts"),

  getAccountDetails: (accountId: string) =>
    api.get<Account>(`/accounts/${accountId}`),

  createAccount: (data: CreateAccountData) =>
    api.post<Account>("/accounts", data),
};

export const transactionAPI = {
  getTransactions: (params?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => api.get<Transaction[]>("/transactions", { params }),

  getTransactionById: (transactionId: string) =>
    api.get<Transaction>(`/transactions/${transactionId}`),

  createTransaction: (data: CreateTransactionData) =>
    api.post<Transaction>("/transactions", data),
};

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/register", {
      name,
      email,
      password,
    }),

  verifyToken: (token: string) =>
    api.post<{ valid: boolean }>("/auth/verify", { token }),
};

export const loanAPI = {
  getLoans: () => api.get<Loan[]>("/loans"),

  getLoanDetails: (loanId: string) => api.get<Loan>(`/loans/${loanId}`),

  applyForLoan: (data: CreateLoanData) => api.post<Loan>("/loans", data),
};

export const savingsAPI = {
  getSavingsGoals: () => api.get<SavingsGoal[]>("/savings-goals"),

  getSavingsGoalById: (goalId: string) =>
    api.get<SavingsGoal>(`/savings-goals/${goalId}`),

  createSavingsGoal: (data: CreateSavingsGoalData) =>
    api.post<SavingsGoal>("/savings-goals", data),

  updateSavingsGoal: (goalId: string, data: Partial<CreateSavingsGoalData>) =>
    api.put<SavingsGoal>(`/savings-goals/${goalId}`, data),

  deleteSavingsGoal: (goalId: string) =>
    api.delete<void>(`/savings-goals/${goalId}`),
};

export const reportAPI = {
  getReports: () => api.get<Report[]>("/reports"),

  getReportById: (reportId: string) => api.get<Report>(`/reports/${reportId}`),

  createReport: (data: CreateReportData) => api.post<Report>("/reports", data),
};

export default api;
