import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Reports from "../Reports";

const mockReports = [
  {
    id: 1,
    reportType: "ACCOUNT_SUMMARY",
    status: "COMPLETED",
    generatedAt: "2025-05-01T10:00:00",
    requestedBy: "admin",
    accountId: 100,
  },
  {
    id: 2,
    reportType: "TRANSACTION_HISTORY",
    status: "PENDING",
    generatedAt: "2025-05-02T11:00:00",
    requestedBy: null,
    accountId: null,
  },
];

const mockCreateReport = jest.fn();

jest.mock("../../services/api", () => ({
  reportAPI: {
    getReports: jest.fn().mockResolvedValue({ data: mockReports }),
    createReport: mockCreateReport,
  },
}));

const renderReports = () =>
  render(
    <BrowserRouter>
      <Reports />
    </BrowserRouter>,
  );

describe("Reports Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateReport.mockResolvedValue({
      data: {
        id: 99,
        reportType: "MONTHLY_STATEMENT",
        status: "PENDING",
        generatedAt: new Date().toISOString(),
      },
    });
  });

  test("shows loading spinner initially", () => {
    renderReports();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders Reports heading", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Reports")).toBeInTheDocument();
    });
  });

  test("renders existing reports in table", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Account Summary")).toBeInTheDocument();
      expect(screen.getByText("Transaction History")).toBeInTheDocument();
    });
  });

  test("renders report status chips", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("COMPLETED")).toBeInTheDocument();
      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });
  });

  test("opens generate report dialog when button is clicked", async () => {
    renderReports();
    await waitFor(() => screen.getByText("Reports"));
    fireEvent.click(screen.getByRole("button", { name: /Generate Report/i }));
    expect(screen.getByText("Generate New Report")).toBeInTheDocument();
  });

  test("submits report generation form", async () => {
    renderReports();
    await waitFor(() => screen.getByText("Reports"));
    fireEvent.click(screen.getByRole("button", { name: /Generate Report/i }));
    fireEvent.click(screen.getByRole("button", { name: /Generate$/i }));
    await waitFor(() => {
      expect(mockCreateReport).toHaveBeenCalledWith(
        expect.objectContaining({ reportType: "ACCOUNT_SUMMARY" }),
      );
    });
  });

  test("shows empty state when no reports", async () => {
    const { reportAPI } = require("../../services/api");
    reportAPI.getReports.mockResolvedValueOnce({ data: [] });
    renderReports();
    await waitFor(() => {
      expect(screen.getByText(/No Reports Yet/i)).toBeInTheDocument();
    });
  });

  test("displays report IDs in table", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
      expect(screen.getByText("#2")).toBeInTheDocument();
    });
  });
});
