// Modern Dashboard component with enhanced UI

import {
  AccountBalance as AccountIcon,
  Add as AddIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
  MoreHoriz as MoreHorizIcon,
  Notifications as NotificationsIcon,
  Receipt as ReceiptIcon,
  Savings as SavingsIcon,
  ShowChart as ShowChartIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import type React from "react";
import { useEffect, useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
// Import custom components
import GridCompatibility from "../components/GridCompatibility";
import { useAuth } from "../context/AuthContext";
import { accountAPI, savingsAPI, transactionAPI } from "../services/api";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState({
    balance: 0,
    accountNumber: "",
    accountType: "",
    accountId: "",
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch accounts
        const accountsResponse = await accountAPI.getAccounts();
        if (accountsResponse.data && accountsResponse.data.length > 0) {
          const account = accountsResponse.data[0]; // Get first account
          setAccountData({
            balance: account.balance,
            accountNumber: `****${String(account.accountId).slice(-4)}`,
            accountType: account.accountType,
            accountId: String(account.accountId),
          });
        }

        // Fetch recent transactions
        const transactionsResponse = await transactionAPI.getTransactions({
          limit: 5,
        });
        setRecentTransactions(transactionsResponse.data || []);

        // Fetch savings goals
        const savingsResponse = await savingsAPI.getSavingsGoals();
        setSavingsGoals(savingsResponse.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Spending breakdown chart data
  const spendingData = {
    labels: ["Housing", "Food", "Transportation", "Entertainment", "Utilities"],
    datasets: [
      {
        data: [35, 25, 15, 15, 10],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.info.main,
        ],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  const spendingOptions = {
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  // Monthly balance chart data
  const balanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Balance",
        data: [9500, 10200, 11000, 10800, 11500, 12500],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const balanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          borderDash: [3, 3],
          color: theme.palette.divider,
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Welcome back, {user?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your finances today
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AttachMoneyIcon />}
            onClick={() => navigate("/transactions")}
          >
            Transfer Money
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={() => navigate("/accounts/1")}
          >
            View Statements
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <GridCompatibility container spacing={3} sx={{ mb: 4 }}>
        <GridCompatibility xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.06)",
              },
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: `${theme.palette.primary.main}15`,
                  color: theme.palette.primary.main,
                }}
              >
                <AccountIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: `${theme.palette.success.main}15`,
                  color: theme.palette.success.main,
                  borderRadius: 6,
                  px: 1,
                  py: 0.5,
                  height: "fit-content",
                }}
              >
                <ArrowUpwardIcon
                  fontSize="small"
                  sx={{ mr: 0.5, fontSize: 16 }}
                />
                <Typography variant="caption" fontWeight={600}>
                  12.5%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Balance
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              $
              {accountData.balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Typography>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/accounts/1")}
              sx={{ mt: 1, p: 0 }}
            >
              View Details
            </Button>
          </Paper>
        </GridCompatibility>

        <GridCompatibility xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.06)",
              },
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: `${theme.palette.success.main}15`,
                  color: theme.palette.success.main,
                }}
              >
                <ArrowUpwardIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: `${theme.palette.success.main}15`,
                  color: theme.palette.success.main,
                  borderRadius: 6,
                  px: 1,
                  py: 0.5,
                  height: "fit-content",
                }}
              >
                <ArrowUpwardIcon
                  fontSize="small"
                  sx={{ mr: 0.5, fontSize: 16 }}
                />
                <Typography variant="caption" fontWeight={600}>
                  8.2%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Monthly Income
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              $5,240.50
            </Typography>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/transactions")}
              sx={{ mt: 1, p: 0 }}
            >
              View Transactions
            </Button>
          </Paper>
        </GridCompatibility>

        <GridCompatibility xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.06)",
              },
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: `${theme.palette.error.main}15`,
                  color: theme.palette.error.main,
                }}
              >
                <ArrowDownwardIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: `${theme.palette.error.main}15`,
                  color: theme.palette.error.main,
                  borderRadius: 6,
                  px: 1,
                  py: 0.5,
                  height: "fit-content",
                }}
              >
                <ArrowDownwardIcon
                  fontSize="small"
                  sx={{ mr: 0.5, fontSize: 16 }}
                />
                <Typography variant="caption" fontWeight={600}>
                  3.1%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Monthly Expenses
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              $3,570.25
            </Typography>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => setActiveTab(1)}
              sx={{ mt: 1, p: 0 }}
            >
              View Breakdown
            </Button>
          </Paper>
        </GridCompatibility>

        <GridCompatibility xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.06)",
              },
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: `${theme.palette.secondary.main}15`,
                  color: theme.palette.secondary.main,
                }}
              >
                <SavingsIcon />
              </Box>
              <Box sx={{ position: "relative", width: 40, height: 40 }}>
                <CircularProgress
                  variant="determinate"
                  value={68}
                  size={40}
                  thickness={4}
                  sx={{
                    color: theme.palette.secondary.main,
                    "& .MuiCircularProgress-circle": {
                      strokeLinecap: "round",
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    68%
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Savings Progress
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              68%
            </Typography>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/savings")}
              sx={{ mt: 1, p: 0 }}
            >
              View Goals
            </Button>
          </Paper>
        </GridCompatibility>
      </GridCompatibility>

      {/* Main Content */}
      <GridCompatibility container spacing={3}>
        {/* Left Column */}
        <GridCompatibility xs={12} md={8}>
          {/* Account Overview */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              mb: 3,
            }}
          >
            <Box
              sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                    mr: 2,
                  }}
                >
                  <ShowChartIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Account Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your balance history for the last 6 months
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ p: 3, height: 350 }}>
              <Line options={balanceOptions} data={balanceData} />
            </Box>
          </Paper>

          {/* Tabs Section */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                mb: 2,
                "& .MuiTabs-indicator": {
                  backgroundColor: theme.palette.primary.main,
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              <Tab
                label="Recent Transactions"
                sx={{
                  fontWeight: 600,
                  "&.Mui-selected": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              <Tab
                label="Spending Breakdown"
                sx={{
                  fontWeight: 600,
                  "&.Mui-selected": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            </Tabs>

            {/* Recent Transactions Tab */}
            {activeTab === 0 && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Transaction History
                  </Typography>
                  <Button
                    color="primary"
                    endIcon={<MoreHorizIcon />}
                    onClick={() => navigate("/transactions")}
                  >
                    View All
                  </Button>
                </Box>
                <Divider />

                {recentTransactions.length > 0 ? (
                  <Box>
                    {recentTransactions.map((transaction: any) => (
                      <Box
                        key={transaction.transactionId}
                        sx={{
                          p: 2,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          "&:last-child": {
                            borderBottom: "none",
                          },
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.01)",
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => navigate("/transactions")}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor:
                                  transaction.transactionType === "CREDIT"
                                    ? `${theme.palette.success.main}15`
                                    : `${theme.palette.error.main}15`,
                                color:
                                  transaction.transactionType === "CREDIT"
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                                mr: 2,
                              }}
                            >
                              {transaction.transactionType === "CREDIT" ? (
                                <ArrowUpwardIcon />
                              ) : (
                                <ArrowDownwardIcon />
                              )}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {transaction.description ||
                                  `Transaction #${transaction.transactionId}`}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(transaction.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                                {" • "}
                                {transaction.category ||
                                  (transaction.transactionType === "CREDIT"
                                    ? "Income"
                                    : "Expense")}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            color={
                              transaction.transactionType === "CREDIT"
                                ? "success.main"
                                : "error.main"
                            }
                          >
                            {transaction.transactionType === "CREDIT"
                              ? "+"
                              : "-"}
                            $
                            {Math.abs(transaction.amount).toLocaleString(
                              "en-US",
                              { minimumFractionDigits: 2 },
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                      No recent transactions found.
                    </Typography>
                    <Button
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={() => navigate("/transactions")}
                    >
                      Make a Transaction
                    </Button>
                  </Box>
                )}
              </Paper>
            )}

            {/* Spending Breakdown Tab */}
            {activeTab === 1 && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  p: 3,
                }}
              >
                <GridCompatibility container spacing={3}>
                  <GridCompatibility xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ mb: 3 }}
                    >
                      Monthly Spending Categories
                    </Typography>
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <Doughnut data={spendingData} options={spendingOptions} />
                      <Box sx={{ position: "absolute", textAlign: "center" }}>
                        <Typography variant="h4" fontWeight={700}>
                          $3,570
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Box>
                    </Box>
                  </GridCompatibility>

                  <GridCompatibility xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ mb: 3 }}
                    >
                      Top Expenses
                    </Typography>
                    <Box>
                      {[
                        { category: "Housing", amount: 1250, percentage: 35 },
                        { category: "Food", amount: 892.5, percentage: 25 },
                        {
                          category: "Transportation",
                          amount: 535.5,
                          percentage: 15,
                        },
                        {
                          category: "Entertainment",
                          amount: 535.5,
                          percentage: 15,
                        },
                        { category: "Utilities", amount: 357, percentage: 10 },
                      ].map((expense, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {expense.category}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              ${expense.amount.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              width: "100%",
                              bgcolor: "rgba(0, 0, 0, 0.04)",
                              borderRadius: 5,
                              height: 8,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${expense.percentage}%`,
                                bgcolor:
                                  index === 0
                                    ? theme.palette.primary.main
                                    : index === 1
                                      ? theme.palette.secondary.main
                                      : index === 2
                                        ? theme.palette.success.main
                                        : index === 3
                                          ? theme.palette.warning.main
                                          : theme.palette.info.main,
                                height: "100%",
                                borderRadius: 5,
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </GridCompatibility>
                </GridCompatibility>
              </Paper>
            )}
          </Box>
        </GridCompatibility>

        {/* Right Column */}
        <GridCompatibility xs={12} md={4}>
          {/* Account Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Box
              sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                    mr: 2,
                  }}
                >
                  <AccountIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Your Account
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              <GridCompatibility container spacing={2} sx={{ mb: 3 }}>
                <GridCompatibility xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {accountData.accountType}
                  </Typography>
                </GridCompatibility>
                <GridCompatibility xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {accountData.accountNumber}
                  </Typography>
                </GridCompatibility>
              </GridCompatibility>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/accounts/${accountData.accountId}`)}
                >
                  View Account Details
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/transactions")}
                >
                  Make a Transfer
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Savings Goals */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${theme.palette.secondary.main}15`,
                    color: theme.palette.secondary.main,
                    mr: 2,
                  }}
                >
                  <SavingsIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Savings Goals
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={() => navigate("/savings")}
              >
                New Goal
              </Button>
            </Box>

            <Box sx={{ p: 3 }}>
              {savingsGoals.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {savingsGoals.slice(0, 2).map((goal: any) => (
                    <Box
                      key={goal.goalId}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.01)",
                          cursor: "pointer",
                        },
                      }}
                      onClick={() => navigate("/savings")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: `${theme.palette.secondary.main}15`,
                              color: theme.palette.secondary.main,
                              mr: 2,
                              fontSize: "1.5rem",
                            }}
                          >
                            {goal.category === "VACATION"
                              ? "✈️"
                              : goal.category === "HOME"
                                ? "🏠"
                                : goal.category === "CAR"
                                  ? "🚗"
                                  : goal.category === "EDUCATION"
                                    ? "🎓"
                                    : "💰"}
                          </Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {goal.goalName || goal.name}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: `${theme.palette.secondary.main}15`,
                            color: theme.palette.secondary.main,
                            fontWeight: 600,
                          }}
                        >
                          {Math.round(
                            (goal.currentAmount / goal.targetAmount) * 100,
                          )}
                          %
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            ${goal.currentAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ${goal.targetAmount.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            bgcolor: "rgba(0, 0, 0, 0.04)",
                            borderRadius: 5,
                            height: 6,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%`,
                              bgcolor: theme.palette.secondary.main,
                              height: "100%",
                              borderRadius: 5,
                            }}
                          />
                        </Box>
                      </Box>

                      {goal.targetDate && (
                        <Typography variant="caption" color="text.secondary">
                          Target:{" "}
                          {new Date(goal.targetDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </Typography>
                      )}
                    </Box>
                  ))}

                  {savingsGoals.length > 2 && (
                    <Button
                      variant="text"
                      endIcon={<MoreHorizIcon />}
                      onClick={() => navigate("/savings")}
                      sx={{ alignSelf: "center", mt: 1 }}
                    >
                      View All Goals
                    </Button>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    No savings goals found.
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/savings")}
                  >
                    Create a Goal
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Quick Links */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                    mr: 2,
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Quick Links
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AccountIcon />}
                  onClick={() => navigate("/accounts/" + accountData.accountId)}
                >
                  Manage Cards
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ReceiptIcon />}
                  onClick={() => navigate("/transactions")}
                >
                  Pay Bills
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ShowChartIcon />}
                  onClick={() => navigate("/reports")}
                >
                  Notifications
                </Button>
              </Box>
            </Box>
          </Paper>
        </GridCompatibility>
      </GridCompatibility>
    </Box>
  );
};

export default Dashboard;
