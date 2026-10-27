import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { AuthProvider, useAuth } from "../AuthContext";

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../../services/api", () => ({
  authAPI: {
    login: (...args: unknown[]) => mockLogin(...args),
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const REAL_USER = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  role: "USER",
  createdAt: "",
};

const TestComponent: React.FC = () => {
  const {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    loading,
    error,
    clearError,
  } = useAuth();

  // login and register reject on failure; the rejection is already surfaced
  // through the context's error state, so swallow it in the click handlers.
  const noop = () => {};

  return (
    <div>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>Loading: {loading ? "Yes" : "No"}</p>
      {user && <p>User: {user.name}</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={() => login("test@example.com", "password").catch(noop)}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button
        onClick={() =>
          register("Test User", "test@example.com", "password123").catch(noop)
        }
      >
        Register
      </button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

const renderWithAuth = () =>
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>,
  );

describe("AuthContext", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
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

  // The provider currently runs in demo mode: it starts with a signed-in demo
  // user so the app can be explored without an account. If demo mode is
  // removed, replace this block with tests for the real startup flow.
  describe("demo mode defaults", () => {
    test("starts authenticated as the demo user", () => {
      renderWithAuth();
      expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();
      expect(screen.getByText("User: Demo User")).toBeInTheDocument();
    });

    test("starts without loading or an error", () => {
      renderWithAuth();
      expect(screen.getByText("Loading: No")).toBeInTheDocument();
      expect(screen.queryByText(/^Error:/)).not.toBeInTheDocument();
    });

    test("seeds sessionStorage with a demo session when none exists", () => {
      renderWithAuth();
      expect(sessionStorage.getItem("token")).toBe("demo-token");
      expect(JSON.parse(sessionStorage.getItem("user") ?? "{}")).toMatchObject({
        id: "demo-001",
        email: "demo@finovabank.com",
      });
    });

    test("does not overwrite an existing stored token", () => {
      sessionStorage.setItem("token", "existing-token");
      renderWithAuth();
      expect(sessionStorage.getItem("token")).toBe("existing-token");
    });
  });

  describe("login", () => {
    test("replaces the demo user with the signed-in user", async () => {
      mockLogin.mockResolvedValueOnce({
        data: { token: "test-token", user: REAL_USER },
      });
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Login/i }));

      expect(await screen.findByText("User: Test User")).toBeInTheDocument();
      expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password");
    });

    test("stores the token and user in sessionStorage", async () => {
      mockLogin.mockResolvedValueOnce({
        data: { token: "test-token-123", user: REAL_USER },
      });
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Login/i }));

      await waitFor(() => {
        expect(sessionStorage.getItem("token")).toBe("test-token-123");
      });
      expect(JSON.parse(sessionStorage.getItem("user") ?? "{}")).toEqual(
        REAL_USER,
      );
    });

    test("navigates to the dashboard after a successful login", async () => {
      mockLogin.mockResolvedValueOnce({
        data: { token: "test-token", user: REAL_USER },
      });
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Login/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    test("shows the server message when login fails", async () => {
      mockLogin.mockRejectedValueOnce({
        response: { data: { message: "Invalid credentials" } },
      });
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Login/i }));

      expect(
        await screen.findByText("Error: Invalid credentials"),
      ).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("falls back to a default message when the server gives none", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Network Error"));
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Login/i }));

      expect(
        await screen.findByText(
          "Error: Login failed. Please check your credentials.",
        ),
      ).toBeInTheDocument();
    });

    test("stops loading after a failed login", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Network Error"));
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Login/i }));

      await screen.findByText(/^Error:/);
      expect(screen.getByText("Loading: No")).toBeInTheDocument();
    });

    test("clearError removes the error", async () => {
      mockLogin.mockRejectedValueOnce({
        response: { data: { message: "Bad credentials" } },
      });
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Login/i }));
      await screen.findByText("Error: Bad credentials");

      fireEvent.click(screen.getByRole("button", { name: /Clear Error/i }));

      await waitFor(() => {
        expect(screen.queryByText(/^Error:/)).not.toBeInTheDocument();
      });
    });
  });

  describe("register", () => {
    test("registers the user, stores the session, and goes to the dashboard", async () => {
      mockRegister.mockResolvedValueOnce({
        data: {
          token: "reg-token",
          user: { ...REAL_USER, id: "3", name: "New User" },
        },
      });
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Register/i }));

      expect(await screen.findByText("User: New User")).toBeInTheDocument();
      expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();
      expect(mockRegister).toHaveBeenCalledWith(
        "Test User",
        "test@example.com",
        "password123",
      );
      expect(sessionStorage.getItem("token")).toBe("reg-token");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    test("shows a default message when registration fails", async () => {
      mockRegister.mockRejectedValueOnce(new Error("Network Error"));
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Register/i }));

      expect(
        await screen.findByText(
          "Error: Registration failed. Please try again.",
        ),
      ).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    test("clears the session and marks the user as unauthenticated", async () => {
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Logout/i }));

      expect(await screen.findByText("Authenticated: No")).toBeInTheDocument();
      expect(screen.queryByText(/^User:/)).not.toBeInTheDocument();
      expect(sessionStorage.getItem("token")).toBeNull();
      expect(sessionStorage.getItem("user")).toBeNull();
    });

    test("navigates to the public homepage", async () => {
      renderWithAuth();

      fireEvent.click(screen.getByRole("button", { name: /Logout/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/home");
      });
    });
  });
});
