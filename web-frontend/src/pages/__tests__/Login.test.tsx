import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";

// Assuming the component exists in the original project at:
// /FinovaBank/web-frontend/src/pages/Login.tsx
// Adjust the import path if necessary.
// import Login from '../../../../FinovaBank/web-frontend/src/pages/Login';

// Placeholder component for testing structure
const Login: React.FC = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const handleLogin = () => {
    console.log("Logging in with:", username, password);
    // Mock login logic
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Username"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

describe("Login Page", () => {
  test("renders login form elements", () => {
    render(<Login />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("allows user to input username and password", () => {
    render(<Login />);
    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  test("calls login handler on button click", () => {
    // Mock the console.log or the actual login function if imported
    const consoleSpy = jest.spyOn(console, "log");
    render(<Login />);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.click(loginButton);

    // Check if the mock login logic (console.log in this placeholder) was called
    expect(consoleSpy).toHaveBeenCalled(); // Or check if the actual login function was called
    consoleSpy.mockRestore(); // Clean up the spy
  });
});
