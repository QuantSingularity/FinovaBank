import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../Dashboard";

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
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
        },
      ],
    }),
  },
  savingsAPI: {
    getSavingsGoals: jest.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          goalName: "Vacation",
          targetAmount: 5000,
          currentAmount: 2500,
          targetDate: "2025-12-31",
        },
      ],
    }),
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

  test("renders welcome message with user name after load", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test User/i)).toBeInTheDocument();
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

  test("renders recent transactions section", async () => {
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

  test("renders savings goals section", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Savings Goals/i)).toBeInTheDocument();
    });
  });

  test("renders savings goal name", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Vacation")).toBeInTheDocument();
    });
  });
});
