import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AccountDetails from "../AccountDetails";

const mockAccount = {
  accountId: "ACC123456",
  accountType: "CHECKING",
  balance: 1159.06,
  name: "John Doe",
  email: "john@example.com",
  currency: "USD",
  createdAt: "2023-01-15T10:00:00",
  createdDate: "2023-01-15",
};

const mockTransactions = [
  {
    transactionId: "T001",
    description: "Grocery Store",
    amount: 75.5,
    transactionType: "DEBIT",
    date: "2025-05-01",
    status: "COMPLETED",
  },
  {
    transactionId: "T002",
    description: "Salary",
    amount: 2000.0,
    transactionType: "CREDIT",
    date: "2025-04-28",
    status: "COMPLETED",
  },
];

jest.mock("../../services/api", () => ({
  accountAPI: {
    getAccountDetails: jest.fn().mockResolvedValue({ data: mockAccount }),
  },
  transactionAPI: {
    getTransactions: jest.fn().mockResolvedValue({ data: mockTransactions }),
  },
}));

const renderAccountDetails = (accountId = "ACC123456") =>
  render(
    <MemoryRouter initialEntries={[`/accounts/${accountId}`]}>
      <Routes>
        <Route path="/accounts/:accountId" element={<AccountDetails />} />
      </Routes>
    </MemoryRouter>,
  );

describe("AccountDetails Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading spinner initially", () => {
    renderAccountDetails();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders account details heading", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("Account Details")).toBeInTheDocument();
    });
  });

  test("renders account holder name", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  test("renders account type", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("CHECKING")).toBeInTheDocument();
    });
  });

  test("renders masked account number", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("****3456")).toBeInTheDocument();
    });
  });

  test("renders account balance", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("$1,159.06")).toBeInTheDocument();
    });
  });

  test("renders transaction history", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("Transaction History")).toBeInTheDocument();
    });
  });

  test("renders transaction descriptions in table", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
      expect(screen.getByText("Salary")).toBeInTheDocument();
    });
  });

  test("renders account information card", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("Account Information")).toBeInTheDocument();
    });
  });

  test("renders account actions card", async () => {
    renderAccountDetails();
    await waitFor(() => {
      expect(screen.getByText("Account Actions")).toBeInTheDocument();
    });
  });
});
