import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Reports from "../Reports";

const mockReports = [
  {
    reportId: "RPT-001ABC",
    reportType: "ACCOUNT_SUMMARY",
    status: "COMPLETED",
    generatedAt: "2025-04-01T10:00:00Z",
    accountId: "ACC001",
  },
  {
    reportId: "RPT-002DEF",
    reportType: "TRANSACTION_HISTORY",
    status: "PENDING",
    generatedAt: "2025-04-02T12:00:00Z",
  },
];

jest.mock("../../services/api", () => ({
  reportAPI: {
    getReports: jest.fn().mockResolvedValue({ data: mockReports }),
    createReport: jest
      .fn()
      .mockResolvedValue({
        data: {
          reportId: "RPT-003",
          reportType: "SAVINGS_ANALYSIS",
          status: "PENDING",
          generatedAt: new Date().toISOString(),
        },
      }),
  },
}));

const renderComponent = () =>
  render(
    <BrowserRouter>
      <Reports />
    </BrowserRouter>,
  );

describe("Reports Page", () => {
  test("shows loading initially", () => {
    renderComponent();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders reports table after loading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Account Summary")).toBeInTheDocument();
      expect(screen.getByText("Transaction History")).toBeInTheDocument();
    });
  });

  test("renders Reports heading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/^Reports$/)).toBeInTheDocument();
    });
  });

  test("renders Generate Report button", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Generate Report/i)).toBeInTheDocument();
    });
  });

  test("shows COMPLETED and PENDING status chips", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("COMPLETED")).toBeInTheDocument();
      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });
  });

  test("opens generate report dialog", async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/Generate Report/i));
    fireEvent.click(screen.getAllByText(/Generate Report/i)[0]);
    await waitFor(() => {
      expect(screen.getByText(/Generate New Report/i)).toBeInTheDocument();
    });
  });

  test("shows report count in history header", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Report History \(2\)/i)).toBeInTheDocument();
    });
  });
});
