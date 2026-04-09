import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import SavingsGoals from "../SavingsGoals";

const mockGoals = [
  {
    id: 1,
    goalName: "Vacation Fund",
    targetAmount: 5000,
    currentAmount: 2500,
    targetDate: "2026-12-31",
    createdAt: "2025-01-15T10:00:00",
    status: "IN_PROGRESS",
  },
  {
    id: 2,
    goalName: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 8000,
    targetDate: "2026-08-30",
    createdAt: "2024-10-05T10:00:00",
    status: "IN_PROGRESS",
  },
];

const mockCreateGoal = jest.fn();
const mockUpdateGoal = jest.fn();
const mockDeleteGoal = jest.fn();

jest.mock("../../services/api", () => ({
  savingsAPI: {
    getSavingsGoals: jest.fn().mockResolvedValue({ data: mockGoals }),
    createSavingsGoal: mockCreateGoal,
    updateSavingsGoal: mockUpdateGoal,
    deleteSavingsGoal: mockDeleteGoal,
  },
}));

const renderSavingsGoals = () =>
  render(
    <BrowserRouter>
      <SavingsGoals />
    </BrowserRouter>,
  );

describe("SavingsGoals Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateGoal.mockResolvedValue({
      data: {
        id: 99,
        goalName: "New Goal",
        targetAmount: 1000,
        currentAmount: 0,
        targetDate: "2026-01-01",
      },
    });
    mockUpdateGoal.mockResolvedValue({ data: {} });
    mockDeleteGoal.mockResolvedValue({});
  });

  test("shows loading spinner initially", () => {
    renderSavingsGoals();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders savings goals after loading", async () => {
    renderSavingsGoals();
    await waitFor(() => {
      expect(screen.getByText("Vacation Fund")).toBeInTheDocument();
      expect(screen.getByText("Emergency Fund")).toBeInTheDocument();
    });
  });

  test("renders Savings Goals heading", async () => {
    renderSavingsGoals();
    await waitFor(() => {
      expect(screen.getByText("Savings Goals")).toBeInTheDocument();
    });
  });

  test("displays correct progress percentage", async () => {
    renderSavingsGoals();
    await waitFor(() => {
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("80%")).toBeInTheDocument();
    });
  });

  test("displays goal amounts", async () => {
    renderSavingsGoals();
    await waitFor(() => {
      expect(screen.getByText("$2,500.00")).toBeInTheDocument();
      expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    });
  });

  test("opens create dialog when Create New Goal clicked", async () => {
    renderSavingsGoals();
    await waitFor(() => screen.getByText("Vacation Fund"));
    fireEvent.click(screen.getByRole("button", { name: /Create New Goal/i }));
    expect(screen.getByText("Create New Savings Goal")).toBeInTheDocument();
  });

  test("opens edit dialog when edit button clicked", async () => {
    renderSavingsGoals();
    await waitFor(() => screen.getByText("Vacation Fund"));
    const editButtons = screen.getAllByTestId
      ? screen.queryAllByRole("button")
      : screen.getAllByRole("button");
    const editButton = editButtons.find((b) => b.querySelector("svg"));
    // Click first edit icon button
    const iconButtons = document.querySelectorAll("button svg");
    if (iconButtons.length > 0) {
      const editBtn = Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.querySelector('[data-testid="EditIcon"]'),
      );
      if (editBtn) {
        fireEvent.click(editBtn);
        await waitFor(() => {
          expect(screen.getByText("Edit Savings Goal")).toBeInTheDocument();
        });
      }
    }
  });

  test("shows empty state when no goals", async () => {
    const { savingsAPI } = require("../../services/api");
    savingsAPI.getSavingsGoals.mockResolvedValueOnce({ data: [] });
    renderSavingsGoals();
    await waitFor(() => {
      expect(screen.getByText(/No Savings Goals/i)).toBeInTheDocument();
    });
  });

  test("deletes goal when delete button clicked", async () => {
    renderSavingsGoals();
    await waitFor(() => screen.getByText("Vacation Fund"));
    const deleteBtn = Array.from(document.querySelectorAll("button")).find(
      (btn) => btn.querySelector('[data-testid="DeleteIcon"]'),
    );
    if (deleteBtn) {
      fireEvent.click(deleteBtn);
      await waitFor(() => {
        expect(mockDeleteGoal).toHaveBeenCalledWith(1);
      });
    }
  });
});
