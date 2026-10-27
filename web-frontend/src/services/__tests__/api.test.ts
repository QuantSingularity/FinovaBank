import api, {
  accountAPI,
  authAPI,
  loanAPI,
  reportAPI,
  savingsAPI,
  transactionAPI,
} from "../api";

// api.ts calls axios.create() as soon as it is imported, and jest.mock calls
// are hoisted above imports. The mocked instance therefore has to be built
// inside the factory so it already exists when api.ts is evaluated; setting
// it up in the test body would run too late.
jest.mock("axios", () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: { create: jest.fn(() => instance) },
  };
});

// The default export of api.ts is the (mocked) axios instance.
const mockApiInstance = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  interceptors: {
    request: { use: jest.Mock };
    response: { use: jest.Mock };
  };
};

// Interceptors are registered once at import time. Capture them here, before
// the beforeEach hook below clears the mock call history.
const [requestInterceptor] = mockApiInstance.interceptors.request.use.mock
  .calls[0] as [(config: { headers: Record<string, string> }) => any];
const [, responseErrorInterceptor] = mockApiInstance.interceptors.response.use
  .mock.calls[0] as [unknown, (error: unknown) => Promise<never>];

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  describe("authAPI", () => {
    test("login calls correct endpoint", async () => {
      mockApiInstance.post.mockResolvedValueOnce({
        data: { token: "token", user: { id: "1" } },
      });
      await authAPI.login("test@example.com", "password");
      expect(mockApiInstance.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password",
      });
    });

    test("register calls correct endpoint", async () => {
      mockApiInstance.post.mockResolvedValueOnce({
        data: { token: "token", user: { id: "2" } },
      });
      await authAPI.register("John", "john@example.com", "pass123");
      expect(mockApiInstance.post).toHaveBeenCalledWith("/auth/register", {
        name: "John",
        email: "john@example.com",
        password: "pass123",
      });
    });

    test("verifyToken calls correct endpoint", async () => {
      mockApiInstance.post.mockResolvedValueOnce({ data: { valid: true } });
      await authAPI.verifyToken("my-token");
      expect(mockApiInstance.post).toHaveBeenCalledWith("/auth/verify", {
        token: "my-token",
      });
    });
  });

  describe("accountAPI", () => {
    test("getAccounts calls correct endpoint", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: [] });
      await accountAPI.getAccounts();
      expect(mockApiInstance.get).toHaveBeenCalledWith("/accounts");
    });

    test("getAccountDetails calls correct endpoint with string ID", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: {} });
      await accountAPI.getAccountDetails("ACC001");
      expect(mockApiInstance.get).toHaveBeenCalledWith("/accounts/ACC001");
    });

    test("createAccount posts to correct endpoint with correct field name", async () => {
      mockApiInstance.post.mockResolvedValueOnce({ data: {} });
      await accountAPI.createAccount({
        accountType: "CHECKING",
        currency: "USD",
      });
      expect(mockApiInstance.post).toHaveBeenCalledWith("/accounts", {
        accountType: "CHECKING",
        currency: "USD",
      });
    });
  });

  describe("transactionAPI", () => {
    test("getTransactions calls correct endpoint", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: [] });
      await transactionAPI.getTransactions();
      expect(mockApiInstance.get).toHaveBeenCalledWith("/transactions", {
        params: undefined,
      });
    });

    test("getTransactionById accepts string ID", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: {} });
      await transactionAPI.getTransactionById("T001");
      expect(mockApiInstance.get).toHaveBeenCalledWith("/transactions/T001");
    });

    test("createTransaction posts to correct endpoint", async () => {
      mockApiInstance.post.mockResolvedValueOnce({ data: {} });
      const payload = {
        type: "DEPOSIT" as const,
        amount: 500,
        description: "Test",
        accountId: "ACC001",
      };
      await transactionAPI.createTransaction(payload);
      expect(mockApiInstance.post).toHaveBeenCalledWith(
        "/transactions",
        payload,
      );
    });
  });

  describe("savingsAPI", () => {
    test("getSavingsGoals calls /savings-goals endpoint", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: [] });
      await savingsAPI.getSavingsGoals();
      expect(mockApiInstance.get).toHaveBeenCalledWith("/savings-goals");
    });

    test("createSavingsGoal posts to /savings-goals", async () => {
      mockApiInstance.post.mockResolvedValueOnce({ data: {} });
      const payload = {
        goalName: "Vacation",
        targetAmount: 5000,
        targetDate: "2026-01-01",
      };
      await savingsAPI.createSavingsGoal(payload);
      expect(mockApiInstance.post).toHaveBeenCalledWith(
        "/savings-goals",
        payload,
      );
    });

    test("updateSavingsGoal uses string ID", async () => {
      mockApiInstance.put.mockResolvedValueOnce({ data: {} });
      await savingsAPI.updateSavingsGoal("GOAL-001", { goalName: "Updated" });
      expect(mockApiInstance.put).toHaveBeenCalledWith(
        "/savings-goals/GOAL-001",
        { goalName: "Updated" },
      );
    });

    test("deleteSavingsGoal uses string ID", async () => {
      mockApiInstance.delete.mockResolvedValueOnce({});
      await savingsAPI.deleteSavingsGoal("GOAL-001");
      expect(mockApiInstance.delete).toHaveBeenCalledWith(
        "/savings-goals/GOAL-001",
      );
    });
  });

  describe("loanAPI", () => {
    test("getLoans calls correct endpoint", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: [] });
      await loanAPI.getLoans();
      expect(mockApiInstance.get).toHaveBeenCalledWith("/loans");
    });

    test("applyForLoan posts to correct endpoint", async () => {
      mockApiInstance.post.mockResolvedValueOnce({ data: {} });
      const payload = {
        loanAmount: 10000,
        loanType: "PERSONAL",
        durationInMonths: 24,
      };
      await loanAPI.applyForLoan(payload);
      expect(mockApiInstance.post).toHaveBeenCalledWith("/loans", payload);
    });

    test("getLoanDetails calls correct endpoint with string ID", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: {} });
      await loanAPI.getLoanDetails("LOAN-001");
      expect(mockApiInstance.get).toHaveBeenCalledWith("/loans/LOAN-001");
    });
  });

  describe("reportAPI", () => {
    test("getReports calls /reports endpoint", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: [] });
      await reportAPI.getReports();
      expect(mockApiInstance.get).toHaveBeenCalledWith("/reports");
    });

    test("getReportById accepts string ID", async () => {
      mockApiInstance.get.mockResolvedValueOnce({ data: {} });
      await reportAPI.getReportById("RPT-001");
      expect(mockApiInstance.get).toHaveBeenCalledWith("/reports/RPT-001");
    });

    test("createReport posts to correct endpoint with requestedBy", async () => {
      mockApiInstance.post.mockResolvedValueOnce({ data: {} });
      await reportAPI.createReport({
        reportType: "ACCOUNT_SUMMARY",
        requestedBy: "John",
      });
      expect(mockApiInstance.post).toHaveBeenCalledWith("/reports", {
        reportType: "ACCOUNT_SUMMARY",
        requestedBy: "John",
      });
    });
  });

  describe("request interceptor", () => {
    test("adds a Bearer token header when a token is stored", () => {
      sessionStorage.setItem("token", "abc123");
      const config = requestInterceptor({ headers: {} });
      expect(config.headers.Authorization).toBe("Bearer abc123");
    });

    test("leaves headers untouched when no token is stored", () => {
      const config = requestInterceptor({ headers: {} });
      expect(config.headers.Authorization).toBeUndefined();
    });
  });

  describe("response error interceptor", () => {
    beforeEach(() => {
      // Already on /login, so the interceptor does not try to navigate.
      window.history.pushState({}, "", "/login");
    });

    afterEach(() => {
      window.history.pushState({}, "", "/");
    });

    test("clears the stored session and rejects on a 401 response", async () => {
      sessionStorage.setItem("token", "abc123");
      sessionStorage.setItem("user", JSON.stringify({ id: "1" }));
      const error = { response: { status: 401 } };

      await expect(responseErrorInterceptor(error)).rejects.toBe(error);

      expect(sessionStorage.getItem("token")).toBeNull();
      expect(sessionStorage.getItem("user")).toBeNull();
    });

    test("keeps the stored session on other error statuses", async () => {
      sessionStorage.setItem("token", "abc123");
      const error = { response: { status: 500 } };

      await expect(responseErrorInterceptor(error)).rejects.toBe(error);

      expect(sessionStorage.getItem("token")).toBe("abc123");
    });
  });
});
