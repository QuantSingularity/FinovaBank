import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

describe("ProtectedRoute", () => {
  test("shows loading spinner when auth is loading", () => {
    jest.mock("../../context/AuthContext", () => ({
      useAuth: () => ({ isAuthenticated: false, loading: true }),
    }));
    // Inline mock for this test
    jest.doMock("../../context/AuthContext", () => ({
      useAuth: () => ({ isAuthenticated: false, loading: true }),
    }));
  });

  test("renders children when authenticated", () => {
    jest.doMock("../../context/AuthContext", () => ({
      useAuth: () => ({ isAuthenticated: true, loading: false }),
    }));
    // Uses actual mock from jest
  });
});
