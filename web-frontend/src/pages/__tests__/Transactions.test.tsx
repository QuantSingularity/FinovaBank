import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Transactions from "../Transactions";

const mockTransactions = [
  {
    transactionId: "T001",
    description: "Grocery Store",
    amount: 75.5,
    transactionType: "DEBIT",
    date: "2025-05-01",
    category: "Food",
    status: "COMPLETED",
  },
  {
    transactionId: "T002",
    description: "Salary Deposit",
    amount: 2000.0,
    transactionType: "CREDIT",
    date: "2025-04-28",
    category: "Income",
    status: "COMPLETED",
  },
  {
    transactionId: "T003",
    description: "Coffee Shop",
    amount: 5.0,
    transactionType: "DEBIT",
    date: "2025-04-30",
    category: "Food",
    status: "COMPLETED",
  },
];

jest.mock("../../services/api", () => ({
  transactionAPI: {
    getTransactions: jest.fn().mockResolvedValue({ data: mockTransactions }),
    createTransaction: jest.fn().mockResolvedValue({
      data: {
        transactionId: "T999",
        description: "Test Deposit",
        amount: 100,
        transactionType: "CREDIT",
        date: "2025-06-01",
      },
    }),
  },
}));

const renderTransactions = () =>
  render(
    <BrowserRouter>
      <Transactions />
    </BrowserRouter>,
  );

describe("Transactions Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading spinner initially", () => {
    renderTransactions();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders transaction list after loading", async () => {
    renderTransactions();
    await waitFor(() => {
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
    });
  });

  test("renders all transactions", async () => {
    renderTransactions();
    await waitFor(() => {
      expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    });
  });

  test("renders Transactions page heading", async () => {
    renderTransactions();
    await waitFor(() => {
      expect(screen.getByText("Transactions")).toBeInTheDocument();
    });
  });

  test("filters transactions by search query", async () => {
    renderTransactions();
    await waitFor(() => screen.getByText("Grocery Store"));
    const searchInput = screen.getByPlaceholderText(/Search transactions/i);
    fireEvent.change(searchInput, { target: { value: "Salary" } });
    expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
    expect(screen.queryByText("Grocery Store")).not.toBeInTheDocument();
  });

  test("filters to income tab correctly", async () => {
    renderTransactions();
    await waitFor(() => screen.getByText("Grocery Store"));
    fireEvent.click(screen.getByRole("tab", { name: /Income/i }));
    await waitFor(() => {
      expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
      expect(screen.queryByText("Grocery Store")).not.toBeInTheDocument();
    });
  });

  test("filters to expenses tab correctly", async () => {
    renderTransactions();
    await waitFor(() => screen.getByText("Grocery Store"));
    fireEvent.click(screen.getByRole("tab", { name: /Expenses/i }));
    await waitFor(() => {
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
      expect(screen.queryByText("Salary Deposit")).not.toBeInTheDocument();
    });
  });

  test("shows new transaction dialog when button clicked", async () => {
    renderTransactions();
    await waitFor(() => screen.getByText("Transactions"));
    fireEvent.click(screen.getByRole("button", { name: /New Transfer/i }));
    await waitFor(() => {
      expect(screen.getByText("New Transaction")).toBeInTheDocument();
    });
  });

  test("shows no results message when search has no match", async () => {
    renderTransactions();
    await waitFor(() => screen.getByText("Grocery Store"));
    const searchInput = screen.getByPlaceholderText(/Search transactions/i);
    fireEvent.change(searchInput, { target: { value: "zzznomatch" } });
    expect(
      screen.getByText(/No transactions match your search criteria/i),
    ).toBeInTheDocument();
  });
});
