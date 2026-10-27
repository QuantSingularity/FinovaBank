import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

let mockAuthState = { isAuthenticated: false, loading: false };

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/home" element={<div>Public Home</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Secret Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockAuthState = { isAuthenticated: false, loading: false };
  });

  test("shows loading spinner when auth is loading", () => {
    mockAuthState = { isAuthenticated: false, loading: true };
    renderProtectedRoute();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
    expect(screen.queryByText("Public Home")).not.toBeInTheDocument();
  });

  test("redirects unauthenticated users to the public homepage", () => {
    renderProtectedRoute();
    expect(screen.getByText("Public Home")).toBeInTheDocument();
    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });

  test("renders children when authenticated", () => {
    mockAuthState = { isAuthenticated: true, loading: false };
    renderProtectedRoute();
    expect(screen.getByText("Secret Content")).toBeInTheDocument();
    expect(screen.queryByText("Public Home")).not.toBeInTheDocument();
  });
});
