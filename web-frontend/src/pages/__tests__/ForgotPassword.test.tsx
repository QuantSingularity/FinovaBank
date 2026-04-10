import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import ForgotPassword from "../ForgotPassword";

const renderForgotPassword = () =>
  render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>,
  );

describe("ForgotPassword Page", () => {
  test("renders heading", () => {
    renderForgotPassword();
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
  });

  test("renders email field", () => {
    renderForgotPassword();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  test("shows validation error for empty submission", async () => {
    renderForgotPassword();
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  test("shows success state after valid submission", async () => {
    renderForgotPassword();
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));
    await waitFor(
      () => {
        expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  test("has link back to login", () => {
    renderForgotPassword();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });
});
