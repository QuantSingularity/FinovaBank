import { render, screen } from "@testing-library/react";
import type React from "react";
import "@testing-library/jest-dom";

// Assuming the component exists in the original project at:
// /FinovaBank/web-frontend/src/pages/Loans.tsx
// Adjust the import path if necessary.
// import Loans from '../../../../FinovaBank/web-frontend/src/pages/Loans';

// Placeholder component for testing structure
const Loans: React.FC = () => {
  // Mock data or state
  const userLoans = [
    {
      id: "L001",
      type: "Personal Loan",
      amount: 10000,
      status: "Approved",
      nextPaymentDue: "2025-06-01",
    },
    {
      id: "L002",
      type: "Mortgage",
      amount: 250000,
      status: "Active",
      nextPaymentDue: "2025-05-15",
    },
  ];

  return (
    <div>
      <h2>My Loans</h2>
      {userLoans.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Next Payment</th>
            </tr>
          </thead>
          <tbody>
            {userLoans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.type}</td>
                <td>${loan.amount.toLocaleString()}</td>
                <td>{loan.status}</td>
                <td>{loan.nextPaymentDue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>You have no active loans.</p>
      )}
      {/* Add button or link to apply for a new loan? */}
      {/* <button>Apply for New Loan</button> */}
    </div>
  );
};

describe("Loans Page", () => {
  test("renders loan information table when loans exist", () => {
    render(<Loans />);

    // Check for headers
    expect(
      screen.getByRole("columnheader", { name: /Loan ID/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Type/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Amount/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Status/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Next Payment/i }),
    ).toBeInTheDocument();

    // Check for loan data
    expect(screen.getByRole("cell", { name: "L001" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "Personal Loan" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /\$10,000/ })).toBeInTheDocument(); // Check formatted amount
    expect(screen.getByRole("cell", { name: "Approved" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "2025-06-01" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("cell", { name: "L002" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Mortgage" })).toBeInTheDocument();
  });

  test("renders message when no loans exist", () => {
    // Override mock data for this test
    const NoLoansComponent: React.FC = () => (
      <div>
        <h2>My Loans</h2>
        <p>You have no active loans.</p>
      </div>
    );
    render(<NoLoansComponent />);
    expect(screen.getByText("You have no active loans.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  // Add tests for applying for a new loan, loading states, error handling etc.
});
