import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Loans from "../Loans";

const mockLoans = [
  {
    id: 1001,
    loanAmount: 10000.0,
    loanType: "PERSONAL",
    interestRate: 5.25,
    durationInMonths: 24,
    monthlyPayment: 438.71,
    remainingAmount: 8500.5,
    status: "APPROVED",
    approvalDate: "2025-01-15",
    nextPaymentDate: "2025-05-15",
  },
  {
    id: 1002,
    loanAmount: 5000.0,
    loanType: "EDUCATION",
    interestRate: 4.5,
    durationInMonths: 12,
    monthlyPayment: 428.04,
    remainingAmount: 2140.2,
    status: "PENDING",
    approvalDate: "",
    nextPaymentDate: "",
  },
];

const mockApplyForLoan = jest.fn();

jest.mock("../../services/api", () => ({
  loanAPI: {
    getLoans: jest.fn().mockResolvedValue({ data: mockLoans }),
    applyForLoan: mockApplyForLoan,
  },
}));

const renderLoans = () =>
  render(
    <BrowserRouter>
      <Loans />
    </BrowserRouter>,
  );

describe("Loans Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyForLoan.mockResolvedValue({
      data: {
        id: 9999,
        loanAmount: 5000,
        loanType: "PERSONAL",
        interestRate: 5.25,
        durationInMonths: 12,
        monthlyPayment: 450,
        remainingAmount: 5000,
        status: "PENDING",
        approvalDate: "",
        nextPaymentDate: "",
      },
    });
  });

  test("shows loading spinner initially", () => {
    renderLoans();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders loans after loading", async () => {
    renderLoans();
    await waitFor(() => {
      expect(screen.getByText("Loan #1001")).toBeInTheDocument();
      expect(screen.getByText("Loan #1002")).toBeInTheDocument();
    });
  });

  test("renders loan management heading", async () => {
    renderLoans();
    await waitFor(() => {
      expect(screen.getByText("Loan Management")).toBeInTheDocument();
    });
  });

  test("displays loan status chips", async () => {
    renderLoans();
    await waitFor(() => {
      expect(screen.getByText("APPROVED")).toBeInTheDocument();
      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });
  });

  test("displays loan amounts", async () => {
    renderLoans();
    await waitFor(() => {
      expect(screen.getByText("$10,000.00")).toBeInTheDocument();
      expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    });
  });

  test("displays loan types", async () => {
    renderLoans();
    await waitFor(() => {
      expect(screen.getByText("PERSONAL")).toBeInTheDocument();
      expect(screen.getByText("EDUCATION")).toBeInTheDocument();
    });
  });

  test("opens apply dialog when button is clicked", async () => {
    renderLoans();
    await waitFor(() => screen.getByText("Loan Management"));
    fireEvent.click(
      screen.getByRole("button", { name: /Apply for New Loan/i }),
    );
    expect(screen.getByText("Apply for a New Loan")).toBeInTheDocument();
  });

  test("shows empty state when no loans exist", async () => {
    const { loanAPI } = require("../../services/api");
    loanAPI.getLoans.mockResolvedValueOnce({ data: [] });
    renderLoans();
    await waitFor(() => {
      expect(screen.getByText(/No Active Loans/i)).toBeInTheDocument();
    });
  });

  test("renders Apply for a Loan button in empty state", async () => {
    const { loanAPI } = require("../../services/api");
    loanAPI.getLoans.mockResolvedValueOnce({ data: [] });
    renderLoans();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Apply for a Loan/i }),
      ).toBeInTheDocument();
    });
  });

  test("submits loan application", async () => {
    renderLoans();
    await waitFor(() => screen.getByText("Loan Management"));
    fireEvent.click(
      screen.getByRole("button", { name: /Apply for New Loan/i }),
    );
    expect(screen.getByText("Apply for a New Loan")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Submit Application/i }),
    );
    await waitFor(() => {
      expect(mockApplyForLoan).toHaveBeenCalled();
    });
  });
});
