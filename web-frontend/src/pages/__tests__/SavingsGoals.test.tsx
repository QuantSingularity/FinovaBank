import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import SavingsGoals from "../SavingsGoals";

const mockSavingsGoals = [
  {
    goalId: "GOAL-001",
    goalName: "Vacation Fund",
    targetAmount: 5000,
    currentAmount: 2500,
    targetDate: "2026-12-31",
    createdAt: "2024-01-01",
    status: "ACTIVE",
  },
  {
    goalId: "GOAL-002",
    goalName: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 10000,
    targetDate: "2025-06-30",
    createdAt: "2024-01-01",
    status: "COMPLETED",
  },
];

jest.mock("../../services/api", () => ({
  savingsAPI: {
    getSavingsGoals: jest.fn().mockResolvedValue({ data: mockSavingsGoals }),
    createSavingsGoal: jest.fn().mockResolvedValue({
      data: {
        goalId: "GOAL-003",
        goalName: "New Goal",
        targetAmount: 1000,
        currentAmount: 0,
        targetDate: "2026-01-01",
        createdAt: "",
        status: "ACTIVE",
      },
    }),
    updateSavingsGoal: jest.fn().mockResolvedValue({ data: null }),
    deleteSavingsGoal: jest.fn().mockResolvedValue({}),
  },
}));

const renderComponent = () =>
  render(
    <BrowserRouter>
      <SavingsGoals />
    </BrowserRouter>,
  );

describe("SavingsGoals Page", () => {
  test("shows loading state initially", () => {
    renderComponent();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders goals after loading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Vacation Fund")).toBeInTheDocument();
      expect(screen.getByText("Emergency Fund")).toBeInTheDocument();
    });
  });

  test("renders page title", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Savings Goals/i)).toBeInTheDocument();
    });
  });

  test("renders Create New Goal button", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Create New Goal/i)).toBeInTheDocument();
    });
  });

  test("opens dialog when Create New Goal is clicked", async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/Create New Goal/i));
    fireEvent.click(screen.getByText(/Create New Goal/i));
    await waitFor(() => {
      expect(screen.getByText(/Create New Savings Goal/i)).toBeInTheDocument();
    });
  });

  test("shows progress percentage for active goals", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("50%")).toBeInTheDocument();
    });
  });

  test("shows Goal Achieved chip for completed goals", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Goal Achieved/i)).toBeInTheDocument();
    });
  });
});
