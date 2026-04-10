import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import AccountDetails from "../AccountDetails";

jest.mock("../../services/api", () => ({
  accountAPI: {
    getAccountDetails: jest.fn().mockResolvedValue({
      data: {
        accountId: "ACC001",
        accountType: "CHECKING",
        balance: 7500.0,
        currency: "USD",
        createdAt: "2024-01-01",
        name: "Test User",
        email: "test@example.com",
      },
    }),
  },
  transactionAPI: {
    getTransactions: jest.fn().mockResolvedValue({
      data: [
        {
          transactionId: "T001",
          description: "Grocery Store",
          amount: 85.5,
          transactionType: "DEBIT",
          status: "COMPLETED",
          date: "2025-04-01",
          accountId: "ACC001",
          currency: "USD",
        },
      ],
    }),
  },
}));

const renderWithRoute = () =>
  render(
    <MemoryRouter initialEntries={["/accounts/ACC001"]}>
      <Routes>
        <Route path="/accounts/:accountId" element={<AccountDetails />} />
      </Routes>
    </MemoryRouter>,
  );

describe("AccountDetails Page", () => {
  test("shows loading initially", () => {
    renderWithRoute();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders account details after loading", async () => {
    renderWithRoute();
    await waitFor(() => {
      expect(screen.getByText(/Account Details/i)).toBeInTheDocument();
    });
  });

  test("renders account balance", async () => {
    renderWithRoute();
    await waitFor(() => {
      expect(screen.getByText(/7,500/)).toBeInTheDocument();
    });
  });

  test("renders account type", async () => {
    renderWithRoute();
    await waitFor(() => {
      expect(screen.getByText("CHECKING")).toBeInTheDocument();
    });
  });

  test("renders transaction in history table", async () => {
    renderWithRoute();
    await waitFor(() => {
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
    });
  });
});
