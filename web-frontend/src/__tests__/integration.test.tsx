import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import App from "../App";

jest.mock("../context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    loading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

describe("App Integration Tests", () => {
  test("unauthenticated user sees login page at root", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    });
  });

  test("login page has link to register", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    });
  });

  test("login page has forgot password link", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
    });
  });

  test("app renders without throwing", () => {
    expect(() =>
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>,
      ),
    ).not.toThrow();
  });
});
