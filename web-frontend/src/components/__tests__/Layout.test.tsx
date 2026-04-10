import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Layout from "../Layout";

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      role: "USER",
      createdAt: "",
    },
    logout: jest.fn(),
  }),
}));

const renderLayout = () =>
  render(
    <BrowserRouter>
      <Layout />
    </BrowserRouter>,
  );

describe("Layout Component", () => {
  test("renders without crashing", () => {
    const { container } = renderLayout();
    expect(container).toBeInTheDocument();
  });

  test("renders FinovaBank brand name", () => {
    renderLayout();
    expect(screen.getAllByText(/FinovaBank/i).length).toBeGreaterThan(0);
  });

  test("renders navigation menu items", () => {
    renderLayout();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Savings Goals")).toBeInTheDocument();
    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });

  test("renders user name in sidebar", () => {
    renderLayout();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  test("renders sign out button", () => {
    renderLayout();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
  });

  test("renders notification bell icon", () => {
    renderLayout();
    expect(screen.getByLabelText(/Notifications/i)).toBeInTheDocument();
  });
});
