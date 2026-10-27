import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "../App";

const TEST_USER = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  role: "USER",
  createdAt: "",
};

let mockAuthState: {
  isAuthenticated: boolean;
  user: typeof TEST_USER | null;
  loading: boolean;
} = { isAuthenticated: false, user: null, loading: false };

jest.mock("../context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAuth: () => ({
    ...mockAuthState,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    error: null,
    clearError: jest.fn(),
  }),
}));

jest.mock("../services/api", () => ({
  accountAPI: {
    getAccounts: jest.fn().mockResolvedValue({
      data: [
        {
          accountId: "ACC001",
          accountType: "CHECKING",
          balance: 5000,
          currency: "USD",
          createdAt: "2024-01-01",
        },
      ],
    }),
  },
  transactionAPI: {
    getTransactions: jest.fn().mockResolvedValue({ data: [] }),
  },
  savingsAPI: {
    getSavingsGoals: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

// Exposes the router's current path so tests can assert where a redirect landed.
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderApp = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );

const currentPath = () => screen.getByTestId("location").textContent;

describe("App Integration Tests", () => {
  beforeEach(() => {
    mockAuthState = { isAuthenticated: false, user: null, loading: false };
  });

  describe("unauthenticated visitor", () => {
    test("is redirected from the root to the public homepage", async () => {
      renderApp("/");
      expect(
        await screen.findByRole("button", { name: /Open Free Account/i }),
      ).toBeInTheDocument();
      expect(currentPath()).toBe("/home");
    });

    test("is redirected from the legacy /login route to the homepage", async () => {
      renderApp("/login");
      expect(
        await screen.findByRole("button", { name: /Open Free Account/i }),
      ).toBeInTheDocument();
      expect(currentPath()).toBe("/home");
      expect(screen.queryByText(/Welcome Back/i)).not.toBeInTheDocument();
    });

    test("cannot open the dashboard and is sent to the homepage", async () => {
      renderApp("/dashboard");
      expect(
        await screen.findByRole("button", { name: /Open Free Account/i }),
      ).toBeInTheDocument();
      expect(currentPath()).toBe("/home");
    });

    test("can reach the registration page from the homepage", async () => {
      renderApp("/home");
      fireEvent.click(
        await screen.findByRole("button", { name: /Open Free Account/i }),
      );
      expect(
        await screen.findByRole("heading", { name: /Create Your Account/i }),
      ).toBeInTheDocument();
      expect(currentPath()).toBe("/register");
    });

    test("can open the forgot password page", async () => {
      renderApp("/forgot-password");
      expect(
        await screen.findByRole("heading", { name: /Forgot Password\?/i }),
      ).toBeInTheDocument();
    });

    test("sees the not found page for unknown routes", async () => {
      renderApp("/does-not-exist");
      expect(
        await screen.findByRole("heading", { name: /Page Not Found/i }),
      ).toBeInTheDocument();
    });
  });

  describe("authenticated user", () => {
    beforeEach(() => {
      mockAuthState = {
        isAuthenticated: true,
        user: TEST_USER,
        loading: false,
      };
    });

    test("can open the dashboard inside the app layout", async () => {
      renderApp("/dashboard");
      expect(
        await screen.findByText(/Welcome back, Test/i),
      ).toBeInTheDocument();
      expect(currentPath()).toBe("/dashboard");
      expect(screen.getAllByText("Test User").length).toBeGreaterThan(0);
    });
  });

  test("app renders without throwing", () => {
    expect(() => renderApp("/")).not.toThrow();
  });
});
