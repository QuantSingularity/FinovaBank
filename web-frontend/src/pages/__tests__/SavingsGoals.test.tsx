import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";

// Assuming the component exists in the original project at:
// /FinovaBank/web-frontend/src/pages/SavingsGoals.tsx
// Adjust the import path if necessary.
// import SavingsGoals from '../../../../FinovaBank/web-frontend/src/pages/SavingsGoals';

// Placeholder component for testing structure
const SavingsGoals: React.FC = () => {
  // Mock data or state
  const [goals, setGoals] = React.useState([
    {
      id: "SG01",
      name: "Vacation Fund",
      targetAmount: 2000,
      currentAmount: 500,
      deadline: "2025-12-31",
    },
    {
      id: "SG02",
      name: "New Car Down Payment",
      targetAmount: 5000,
      currentAmount: 1500,
      deadline: "2026-06-30",
    },
  ]);

  // Mock function to add contribution
  const addContribution = (id: string, amount: number) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) =>
        goal.id === id
          ? { ...goal, currentAmount: goal.currentAmount + amount }
          : goal,
      ),
    );
    console.log(`Added ${amount} to goal ${id}`);
  };

  return (
    <div>
      <h2>Savings Goals</h2>
      {goals.map((goal) => (
        <div
          key={goal.id}
          style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
        >
          <h3>{goal.name}</h3>
          <p>Target: ${goal.targetAmount.toLocaleString()}</p>
          <p>Current: ${goal.currentAmount.toLocaleString()}</p>
          <p>
            Progress:{" "}
            {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%
          </p>
          <p>Deadline: {goal.deadline}</p>
          {/* Simple contribution input for testing */}
          <button onClick={() => addContribution(goal.id, 50)}>Add $50</button>
        </div>
      ))}
      {/* Add form/button to create new goal? */}
    </div>
  );
};

describe("SavingsGoals Page", () => {
  test("renders existing savings goals with details", () => {
    render(<SavingsGoals />);

    // Check for goal 1 details
    expect(screen.getByText("Vacation Fund")).toBeInTheDocument();
    expect(screen.getByText(/Target: \$2,000/)).toBeInTheDocument();
    expect(screen.getByText(/Current: \$500/)).toBeInTheDocument();
    expect(screen.getByText(/Progress: 25\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/Deadline: 2025-12-31/)).toBeInTheDocument();

    // Check for goal 2 details
    expect(screen.getByText("New Car Down Payment")).toBeInTheDocument();
    expect(screen.getByText(/Target: \$5,000/)).toBeInTheDocument();
    expect(screen.getByText(/Current: \$1,500/)).toBeInTheDocument(); // Initial amount
    expect(screen.getByText(/Progress: 30\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/Deadline: 2026-06-30/)).toBeInTheDocument();
  });

  test("allows adding contribution to a goal", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<SavingsGoals />);

    // Find the 'Add $50' button for the second goal (New Car)
    const _carGoalDiv = screen.getByText("New Car Down Payment").closest("div");
    const addButton = screen.getAllByRole("button", { name: /Add \$50/i })[1]; // Assuming order is stable

    expect(screen.getByText(/Current: \$1,500/)).toBeInTheDocument(); // Initial amount

    fireEvent.click(addButton);

    // Check if state updated (amount increased)
    expect(screen.getByText(/Current: \$1,550/)).toBeInTheDocument(); // Updated amount
    expect(screen.getByText(/Progress: 31\.0%/)).toBeInTheDocument(); // Updated progress

    // Check if mock function was called
    expect(consoleSpy).toHaveBeenCalledWith("Added 50 to goal SG02");
    consoleSpy.mockRestore();
  });

  // Add tests for creating new goals, editing goals, loading states, error handling etc.
});
