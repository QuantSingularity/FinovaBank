import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../Dashboard";

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      role: "USER",
      createdAt: "",
    },
    isAuthenticated: true,
    loading: false,
  }),
}));

jest.mock("../../services/api", () => ({
  accountAPI: {
    getAccounts: jest.fn().mockResolvedValue({
      data: [
        {
          accountId: "ACC001",
          accountType: "CHECKING",
          balance: 5000.0,
          currency: "USD",
          createdAt: "2024-01-01",
        },
      ],
    }),
  },
  transactionAPI: {
    getTransactions: jest.fn().mockResolvedValue({
      data: [
        {
          transactionId: "T001",
          description: "Test Payment",
          amount: 100,
          transactionType: "DEBIT",
          date: "2025-01-01",
          category: "Shopping",
          status: "COMPLETED",
          accountId: "ACC001",
          currency: "USD",
        },
      ],
    }),
  },
  savingsAPI: {
    getSavingsGoals: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

const renderDashboard = () =>
  render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>,
  );

describe("Dashboard Page", () => {
  test("shows loading state initially", () => {
    renderDashboard();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders welcome message with user first name after load", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test/i)).toBeInTheDocument();
    });
  });

  test("renders total balance card", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Total Balance/i)).toBeInTheDocument();
    });
  });

  test("renders account balance from API", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/5,000\.00/)).toBeInTheDocument();
    });
  });

  test("renders recent transactions tab", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Recent Transactions/i)).toBeInTheDocument();
    });
  });

  test("renders transaction description", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Test Payment")).toBeInTheDocument();
    });
  });

  test("renders monthly income and expense cards", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Monthly Income/i)).toBeInTheDocument();
      expect(screen.getByText(/Monthly Expenses/i)).toBeInTheDocument();
    });
  });

  test("renders savings progress card", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Savings Progress/i)).toBeInTheDocument();
    });
  });

  test("renders quick actions panel", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
    });
  });
});
