import { render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "../App";

// Mock the AuthContext to avoid actual API calls
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
  }),
}));

describe("Integration Tests", () => {
  it("renders login page when not authenticated", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    });
  });

  it("renders application without crashing", () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(container).toBeInTheDocument();
  });
});
