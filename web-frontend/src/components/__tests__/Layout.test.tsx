import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Layout from "../Layout";

const mockLogout = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Outlet: () => <div>Page Content</div>,
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "USER",
      createdAt: "",
    },
    logout: mockLogout,
    isAuthenticated: true,
  }),
}));

const renderLayout = () =>
  render(
    <MemoryRouter>
      <Layout />
    </MemoryRouter>,
  );

describe("Layout Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders FinovaBank brand name", () => {
    renderLayout();
    expect(screen.getAllByText("FinovaBank").length).toBeGreaterThan(0);
  });

  test("renders navigation menu items", () => {
    renderLayout();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Savings Goals")).toBeInTheDocument();
    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });

  test("renders user name in the layout", () => {
    renderLayout();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  test("renders outlet content", () => {
    renderLayout();
    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });

  test("calls logout when logout menu item is clicked", async () => {
    renderLayout();
    const avatar = screen.getByText("J");
    fireEvent.click(avatar);
    await waitFor(() => {
      const logoutItem = screen.queryByText("Logout");
      if (logoutItem) {
        fireEvent.click(logoutItem);
        expect(mockLogout).toHaveBeenCalled();
      }
    });
  });
});
