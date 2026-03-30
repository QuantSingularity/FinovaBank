import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { createContext, type ReactNode, useContext, useState } from "react";
import "@testing-library/jest-dom";

// Assuming the context exists in the original project at:
// /FinovaBank/web-frontend/src/context/AuthContext.tsx
// Adjust the import path if necessary.
// import { AuthProvider, useAuth } from '../../../../FinovaBank/web-frontend/src/context/AuthContext';

// --- Placeholder AuthContext Implementation --- START ---
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
// --- Placeholder AuthContext Implementation --- END ---

// Test Component using the context
const TestComponent: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <button onClick={login}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  test("provides authentication status and actions", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Initial state: Not authenticated
    expect(screen.getByText("Authenticated: No")).toBeInTheDocument();

    // Click login button
    const loginButton = screen.getByRole("button", { name: /login/i });
    act(() => {
      loginButton.click();
    });

    // State after login: Authenticated
    expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();

    // Click logout button
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    act(() => {
      logoutButton.click();
    });

    // State after logout: Not authenticated
    expect(screen.getByText("Authenticated: No")).toBeInTheDocument();
  });

  test("throws error if useAuth is used outside AuthProvider", () => {
    // Suppress console.error output for this specific test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );

    // Restore console.error
    console.error = originalError;
  });
});
