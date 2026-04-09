import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "../AuthContext";
import React from "react";

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockVerifyToken = jest.fn();

jest.mock("../../services/api", () => ({
  authAPI: {
    login: mockLogin,
    register: mockRegister,
    verifyToken: mockVerifyToken,
  },
}));

const TestComponent: React.FC = () => {
  const { isAuthenticated, user, login, logout, register, loading, error } =
    useAuth();
  return (
    <div>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>Loading: {loading ? "Yes" : "No"}</p>
      {user && <p>User: {user.name}</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={() => login("test@example.com", "password")}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button
        onClick={() => register("Test User", "test@example.com", "password123")}
      >
        Register
      </button>
    </div>
  );
};

const renderWithAuth = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>,
  );

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockVerifyToken.mockResolvedValue({ data: { valid: false } });
  });

  test("starts as not authenticated with no session", async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByText("Authenticated: No")).toBeInTheDocument();
    });
  });

  test("throws error if useAuth is used outside AuthProvider", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
    consoleSpy.mockRestore();
  });

  test("sets authenticated state after successful login", async () => {
    mockLogin.mockResolvedValueOnce({
      data: {
        token: "test-token",
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "USER",
          createdAt: "",
        },
      },
    });
    renderWithAuth();
    await waitFor(() => screen.getByText("Authenticated: No"));
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    await waitFor(() => {
      expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();
    });
  });

  test("stores token in sessionStorage after login", async () => {
    mockLogin.mockResolvedValueOnce({
      data: {
        token: "test-token-123",
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "USER",
          createdAt: "",
        },
      },
    });
    renderWithAuth();
    await waitFor(() => screen.getByText("Authenticated: No"));
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    await waitFor(() => {
      expect(sessionStorage.getItem("token")).toBe("test-token-123");
    });
  });

  test("clears session and sets unauthenticated on logout", async () => {
    mockLogin.mockResolvedValueOnce({
      data: {
        token: "test-token",
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "USER",
          createdAt: "",
        },
      },
    });
    renderWithAuth();
    await waitFor(() => screen.getByText("Authenticated: No"));
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    await waitFor(() => screen.getByText("Authenticated: Yes"));
    fireEvent.click(screen.getByRole("button", { name: /Logout/i }));
    await waitFor(() => {
      expect(sessionStorage.getItem("token")).toBeNull();
    });
  });

  test("sets authenticated from valid session on mount", async () => {
    sessionStorage.setItem("token", "existing-token");
    sessionStorage.setItem(
      "user",
      JSON.stringify({
        id: 2,
        name: "Stored User",
        email: "stored@example.com",
        role: "USER",
        createdAt: "",
      }),
    );
    mockVerifyToken.mockResolvedValueOnce({ data: { valid: true } });
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();
      expect(screen.getByText("User: Stored User")).toBeInTheDocument();
    });
  });

  test("registers user and sets authenticated", async () => {
    mockRegister.mockResolvedValueOnce({
      data: {
        token: "reg-token",
        user: {
          id: 3,
          name: "New User",
          email: "new@example.com",
          role: "USER",
          createdAt: "",
        },
      },
    });
    renderWithAuth();
    await waitFor(() => screen.getByText("Authenticated: No"));
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));
    await waitFor(() => {
      expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();
    });
  });
});
