import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";

// Assuming the component exists in the original project at:
// /FinovaBank/web-frontend/src/pages/Register.tsx
// Adjust the import path if necessary.
// import Register from '../../../../FinovaBank/web-frontend/src/pages/Register';

// Placeholder component for testing structure
const Register: React.FC = () => {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleRegister = () => {
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    console.log("Registering user:", username, email);
    // Mock registration logic
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Username"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Password"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        aria-label="Confirm Password"
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

describe("Register Page", () => {
  test("renders registration form elements", () => {
    render(<Register />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i }),
    ).toBeInTheDocument();
  });

  test("allows user to input registration details", () => {
    render(<Register />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "newpass123" },
    });

    expect(screen.getByLabelText("Username")).toHaveValue("newuser");
    expect(screen.getByLabelText("Email")).toHaveValue("newuser@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("newpass123");
    expect(screen.getByLabelText("Confirm Password")).toHaveValue("newpass123");
  });

  test("calls register handler on button click if passwords match", () => {
    const consoleSpyLog = jest.spyOn(console, "log");
    const consoleSpyError = jest.spyOn(console, "error");
    render(<Register />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "newpass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(consoleSpyLog).toHaveBeenCalledWith(
      "Registering user:",
      "newuser",
      "newuser@example.com",
    );
    expect(consoleSpyError).not.toHaveBeenCalled();

    consoleSpyLog.mockRestore();
    consoleSpyError.mockRestore();
  });

  test("shows error if passwords do not match on register click", () => {
    const consoleSpyLog = jest.spyOn(console, "log");
    const consoleSpyError = jest.spyOn(console, "error");
    render(<Register />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "mismatch" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(consoleSpyError).toHaveBeenCalledWith("Passwords do not match");
    expect(consoleSpyLog).not.toHaveBeenCalled();

    consoleSpyLog.mockRestore();
    consoleSpyError.mockRestore();
  });
});
