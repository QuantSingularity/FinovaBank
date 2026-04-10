import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Transactions from "../Transactions";

const mockTransactions = [
  {
    transactionId: "T001",
    accountId: "ACC001",
    transactionType: "CREDIT",
    amount: 500,
    description: "Salary Payment",
    category: "Income",
    status: "COMPLETED",
    date: "2025-04-01",
    currency: "USD",
  },
  {
    transactionId: "T002",
    accountId: "ACC001",
    transactionType: "DEBIT",
    amount: 150,
    description: "Grocery Store",
    category: "Food",
    status: "COMPLETED",
    date: "2025-04-02",
    currency: "USD",
  },
];

jest.mock("../../services/api", () => ({
  transactionAPI: {
    getTransactions: jest.fn().mockResolvedValue({ data: mockTransactions }),
    createTransaction: jest
      .fn()
      .mockResolvedValue({
        data: {
          transactionId: "T003",
          transactionType: "DEPOSIT",
          amount: 200,
          description: "Test",
          date: "2025-04-03",
          status: "COMPLETED",
          accountId: "ACC001",
          currency: "USD",
        },
      }),
  },
}));

const renderComponent = () =>
  render(
    <BrowserRouter>
      <Transactions />
    </BrowserRouter>,
  );

describe("Transactions Page", () => {
  test("shows loading initially", () => {
    renderComponent();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders transactions after loading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Salary Payment")).toBeInTheDocument();
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
    });
  });

  test("renders Transactions heading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/^Transactions$/)).toBeInTheDocument();
    });
  });

  test("renders New Transaction button", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/New Transaction/i)).toBeInTheDocument();
    });
  });

  test("filters transactions by search query", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Salary Payment"));
    const searchInput = screen.getByPlaceholderText(/Search by description/i);
    fireEvent.change(searchInput, { target: { value: "Grocery" } });
    await waitFor(() => {
      expect(screen.queryByText("Salary Payment")).not.toBeInTheDocument();
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
    });
  });

  test("shows summary stats after loading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Total Transactions/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Income/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();
    });
  });

  test("opens New Transaction dialog", async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/New Transaction/i));
    fireEvent.click(screen.getByText(/New Transaction/i));
    await waitFor(() => {
      expect(screen.getByText(/New Transaction$/i)).toBeInTheDocument();
    });
  });
});
