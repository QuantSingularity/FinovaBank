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

  test("renders registration form step 1", () => {
    renderRegister();
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  test("shows validation errors for empty fields on step 1", async () => {
    renderRegister();
    fireEvent.click(screen.getByText(/Next/i));
    await waitFor(() => {
      expect(
        screen.getByText(/Please fill in all required fields/i),
      ).toBeInTheDocument();
    });
  });

  test("shows error for invalid email on step 1", async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "invalid" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });
    fireEvent.click(screen.getByText(/Next/i));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  test("renders Sign In link", () => {
    renderRegister();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });
});
