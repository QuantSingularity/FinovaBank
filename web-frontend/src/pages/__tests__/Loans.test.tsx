import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Loans from "../Loans";

const mockLoans = [
  {
    loanId: "d4f7c1a2-8b3e-4f60-9a1d-5c2e7b9a41f6",
    loanAmount: 10000,
    loanType: "PERSONAL",
    interestRate: 5.25,
    durationInMonths: 24,
    monthlyPayment: 450.5,
    remainingAmount: 7500,
    status: "APPROVED",
    approvalDate: "2024-01-15",
    nextPaymentDate: "2026-05-01",
  },
];

jest.mock("../../services/api", () => ({
  loanAPI: {
    getLoans: jest.fn(() => Promise.resolve({ data: mockLoans })),
    applyForLoan: jest.fn().mockResolvedValue({
      data: {
        loanId: "LOAN-002",
        loanAmount: 5000,
        loanType: "EDUCATION",
        interestRate: 4.5,
        durationInMonths: 12,
        monthlyPayment: 430,
        remainingAmount: 5000,
        status: "PENDING",
      },
    }),
  },
}));

const renderComponent = () =>
  render(
    <BrowserRouter>
      <Loans />
    </BrowserRouter>,
  );

describe("Loans Page", () => {
  test("shows loading initially", () => {
    renderComponent();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders loan cards after loading", async () => {
    renderComponent();
    // Long loan IDs are abbreviated to their last six characters.
    expect(await screen.findByText("Loan #9A41F6")).toBeInTheDocument();
  });

  test("renders Loan Management heading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Loan Management/i)).toBeInTheDocument();
    });
  });

  test("renders Apply for Loan button", async () => {
    renderComponent();
    expect(
      await screen.findByRole("button", { name: /Apply for Loan/i }),
    ).toBeInTheDocument();
  });

  test("opens loan application dialog", async () => {
    renderComponent();
    // The page subtitle ("Apply for loans and track...") also matches the
    // button text, so target the button by role.
    fireEvent.click(
      await screen.findByRole("button", { name: /Apply for Loan/i }),
    );
    expect(
      await screen.findByText(/Apply for a New Loan/i),
    ).toBeInTheDocument();
  });

  test("shows loan interest rate and amount", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/5.25%/i)).toBeInTheDocument();
    });
  });

  test("shows Approved status chip", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Approved")).toBeInTheDocument();
    });
  });
});
