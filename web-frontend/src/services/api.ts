import axios from "axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface Account {
  accountId: string;
  type: string;
  accountType: string;
  balance: number;
  currency: string;
  createdAt: string;
  name?: string;
  email?: string;
  createdDate?: string;
}

export interface Transaction {
  id?: number;
  transactionId?: string;
  type: string;
  transactionType?: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  date?: string;
  timestamp?: string;
  accountId: string | number;
  category?: string;
  status?: string;
  referenceNumber?: string;
  currency?: string;
}

export interface Loan {
  id: number;
  loanAmount: number;
  loanType: string;
  interestRate: number;
  durationInMonths: number;
  monthlyPayment: number;
  remainingAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  approvalDate: string;
  nextPaymentDate: string;
}

export interface SavingsGoal {
  id: number;
  goalId?: number;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt?: string;
  description?: string;
  status?: string;
}

export interface Report {
  id: number;
  accountId?: number;
  customerId?: string;
  reportType: string;
  details?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  filePath?: string;
  generatedAt: string;
  requestedBy?: string;
}

export interface CreateAccountData {
  type: string;
  currency: string;
}

export interface CreateTransactionData {
  type: string;
  amount: number;
  description: string;
  accountId: string | number;
  destinationAccountId?: number;
  currency?: string;
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
  accountId?: number;
  customerId?: string;
  requestedBy?: string;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const accountAPI = {
  getAccounts: () => api.get<Account[]>("/accounts"),

  getAccountDetails: (accountId: string | undefined) =>
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

  getTransactionById: (id: number | string) =>
    api.get<Transaction>(`/transactions/${id}`),

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

  getSavingsGoalById: (goalId: string | number) =>
    api.get<SavingsGoal>(`/savings-goals/${goalId}`),

  createSavingsGoal: (data: CreateSavingsGoalData) =>
    api.post<SavingsGoal>("/savings-goals", data),

  updateSavingsGoal: (goalId: number, data: Partial<CreateSavingsGoalData>) =>
    api.put<SavingsGoal>(`/savings-goals/${goalId}`, data),

  deleteSavingsGoal: (goalId: number) =>
    api.delete<void>(`/savings-goals/${goalId}`),
};

export const reportAPI = {
  getReports: () => api.get<Report[]>("/reports"),

  getReportById: (reportId: number | string) =>
    api.get<Report>(`/reports/${reportId}`),

  createReport: (data: CreateReportData) => api.post<Report>("/reports", data),
};

export default api;
