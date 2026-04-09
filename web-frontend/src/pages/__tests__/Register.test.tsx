import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Register from "../Register";

const mockRegister = jest.fn();

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    register: mockRegister,
    loading: false,
    error: null,
  }),
}));

const renderRegister = () =>
  render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>,
  );

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the first step (Personal Information) by default", () => {
    renderRegister();
    expect(screen.getByText(/Personal Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
  });

  test("renders the FinovaBank brand name", () => {
    renderRegister();
    expect(screen.getByText("FinovaBank")).toBeInTheDocument();
  });

  test("shows error when next is clicked with empty fields", async () => {
    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Please fill in all required fields/i),
      ).toBeInTheDocument();
    });
  });

  test("shows error for invalid email format", async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "invalidemail" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid email address/i),
      ).toBeInTheDocument();
    });
  });

  test("advances to step 2 with valid personal info", async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    await waitFor(() => {
      expect(screen.getByText(/Account Security/i)).toBeInTheDocument();
    });
  });

  test("shows error when passwords do not match on step 2", async () => {
    renderRegister();
    // Fill step 1
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    // Fill step 2
    await waitFor(() => screen.getByLabelText(/^Password$/i));
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "different" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test("has link to login page", () => {
    renderRegister();
    const signInLink = screen.getByRole("link", { name: /Sign In/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/login");
  });
});
