import {
  AccountBalance as AccountIcon,
  Add as AddIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
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
  Tooltip,
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
  Tooltip as ChartTooltip,
} from "chart.js";
import type React from "react";
import { useEffect, useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import GridCompatibility from "../components/GridCompatibility";
import { useAuth } from "../context/AuthContext";
import { accountAPI, savingsAPI, transactionAPI } from "../services/api";
import type { Account, Transaction } from "../services/api";

ChartJS.register(
  ArcElement,
  ChartTooltip,
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
  const [accountData, setAccountData] = useState<Account | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [accountsResponse, transactionsResponse, savingsResponse] =
          await Promise.all([
            accountAPI.getAccounts(),
            transactionAPI.getTransactions({ limit: 5 }),
            savingsAPI.getSavingsGoals(),
          ]);

        if (accountsResponse.data?.length > 0) {
          setAccountData(accountsResponse.data[0]);
        }
        setRecentTransactions(transactionsResponse.data || []);
      } catch {
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        hoverOffset: 8,
      },
    ],
  };

  const spendingOptions = {
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle" as const,
          padding: 20,
          font: { size: 12, family: "Poppins" },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  const balanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Balance",
        data: [9500, 10200, 11000, 10800, 11500, 12500],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}18`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const balanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => ` $${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, family: "Poppins" } },
      },
      y: {
        beginAtZero: false,
        grid: { color: theme.palette.divider },
        ticks: {
          font: { size: 12, family: "Poppins" },
          callback: (value: any) => `$${(value / 1000).toFixed(0)}k`,
        },
      },
    },
    elements: { line: { borderWidth: 3 } },
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    setActiveTab(newValue);

  const balance = accountData?.balance ?? 0;
  const totalIncome = recentTransactions
    .filter((t) => t.transactionType === "CREDIT")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = recentTransactions
    .filter((t) => t.transactionType === "DEBIT")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const statCards = [
    {
      label: "Total Balance",
      value: `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: <AccountIcon />,
      color: theme.palette.primary.main,
      badge: "+12.5%",
      badgeUp: true,
      action: () =>
        accountData
          ? navigate(`/accounts/${accountData.accountId}`)
          : undefined,
      actionLabel: "View Details",
    },
    {
      label: "Monthly Income",
      value:
        totalIncome > 0
          ? `$${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
          : "$5,240.50",
      icon: <ArrowUpwardIcon />,
      color: theme.palette.success.main,
      badge: "+8.2%",
      badgeUp: true,
      action: () => navigate("/transactions"),
      actionLabel: "View Transactions",
    },
    {
      label: "Monthly Expenses",
      value:
        totalExpenses > 0
          ? `$${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
          : "$3,570.25",
      icon: <ArrowDownwardIcon />,
      color: theme.palette.error.main,
      badge: "3.1%",
      badgeUp: false,
      action: () => setActiveTab(1),
      actionLabel: "View Breakdown",
    },
    {
      label: "Savings Progress",
      value: "68%",
      icon: <SavingsIcon />,
      color: theme.palette.secondary.main,
      progress: 68,
      action: () => navigate("/savings"),
      actionLabel: "View Goals",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
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
      {/* Header Banner */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)",
          color: "white",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            right: -60,
            top: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            right: 60,
            bottom: -80,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          },
        }}
      >
        <Box sx={{ zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Here's what's happening with your finances today
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, zIndex: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AttachMoneyIcon />}
            onClick={() => navigate("/transactions")}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            Transfer Money
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={() =>
              accountData && navigate(`/accounts/${accountData.accountId}`)
            }
            disabled={!accountData}
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              color: "white",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            View Statements
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <GridCompatibility container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, idx) => (
          <GridCompatibility item xs={12} sm={6} md={3} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0px 12px 28px rgba(15,23,42,0.08)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${card.color}14`,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
                {card.badge && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: card.badgeUp
                        ? `${theme.palette.success.main}12`
                        : `${theme.palette.error.main}12`,
                      color: card.badgeUp
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                      borderRadius: 6,
                      px: 1,
                      py: 0.5,
                      height: "fit-content",
                    }}
                  >
                    {card.badgeUp ? (
                      <ArrowUpwardIcon sx={{ fontSize: 14, mr: 0.4 }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ fontSize: 14, mr: 0.4 }} />
                    )}
                    <Typography variant="caption" fontWeight={600}>
                      {card.badge}
                    </Typography>
                  </Box>
                )}
                {card.progress !== undefined && (
                  <Box sx={{ position: "relative", width: 44, height: 44 }}>
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={44}
                      thickness={3}
                      sx={{
                        color: theme.palette.grey[200],
                        position: "absolute",
                      }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={card.progress}
                      size={44}
                      thickness={3}
                      sx={{
                        color: card.color,
                        "& .MuiCircularProgress-circle": {
                          strokeLinecap: "round",
                        },
                        position: "absolute",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700 }}>
                        {card.progress}%
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {card.label}
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
                {card.value}
              </Typography>
              <Button
                variant="text"
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                onClick={card.action}
                sx={{
                  p: 0,
                  minWidth: 0,
                  fontSize: "0.8rem",
                  color: card.color,
                }}
              >
                {card.actionLabel}
              </Button>
            </Paper>
          </GridCompatibility>
        ))}
      </GridCompatibility>

      {/* Main Content */}
      <GridCompatibility container spacing={3}>
        <GridCompatibility item xs={12} md={8}>
          {/* Balance Chart */}
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
              sx={{
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                    bgcolor: `${theme.palette.primary.main}12`,
                    color: "primary.main",
                    mr: 2,
                  }}
                >
                  <ShowChartIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Balance History
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last 6 months
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                {["1M", "3M", "6M", "1Y"].map((p) => (
                  <Button
                    key={p}
                    size="small"
                    variant={p === "6M" ? "contained" : "text"}
                    sx={{
                      minWidth: 36,
                      px: 1.5,
                      fontSize: "0.75rem",
                      borderRadius: 2,
                    }}
                  >
                    {p}
                  </Button>
                ))}
              </Box>
            </Box>
            <Box sx={{ p: 3, height: 300 }}>
              <Line options={balanceOptions} data={balanceData} />
            </Box>
          </Paper>

          {/* Transactions / Spending Tabs */}
          <Box>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                mb: 2,
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": { fontWeight: 500, fontSize: "0.9rem" },
              }}
            >
              <Tab label="Recent Transactions" />
              <Tab label="Spending Breakdown" />
            </Tabs>

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
                    p: 2.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Transaction History
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate("/transactions")}
                  >
                    View All
                  </Button>
                </Box>
                <Divider />
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <Box
                      key={transaction.transactionId}
                      sx={{
                        px: 2.5,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        "&:last-child": { borderBottom: "none" },
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.01)",
                          cursor: "pointer",
                        },
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onClick={() => navigate("/transactions")}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            bgcolor:
                              transaction.transactionType === "CREDIT"
                                ? `${theme.palette.success.main}14`
                                : `${theme.palette.error.main}14`,
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
                          <Typography variant="body2" fontWeight={600}>
                            {transaction.description ||
                              `Transaction #${transaction.transactionId}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                            {transaction.category &&
                              ` • ${transaction.category}`}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={
                          transaction.transactionType === "CREDIT"
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {transaction.transactionType === "CREDIT" ? "+" : "-"}$
                        {Math.abs(transaction.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 5, textAlign: "center" }}>
                    <TrendingUpIcon
                      sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
                    />
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      No recent transactions found.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/transactions")}
                    >
                      Make a Transaction
                    </Button>
                  </Box>
                )}
              </Paper>
            )}

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
                  <GridCompatibility item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ mb: 3 }}
                    >
                      Monthly Spending Categories
                    </Typography>
                    <Box
                      sx={{
                        height: 280,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <Doughnut data={spendingData} options={spendingOptions} />
                      <Box sx={{ position: "absolute", textAlign: "center" }}>
                        <Typography variant="h5" fontWeight={800}>
                          $3,570
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Box>
                    </Box>
                  </GridCompatibility>
                  <GridCompatibility item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ mb: 3 }}
                    >
                      Top Expenses
                    </Typography>
                    {[
                      {
                        category: "Housing",
                        amount: 1250,
                        percentage: 35,
                        color: theme.palette.primary.main,
                      },
                      {
                        category: "Food",
                        amount: 892.5,
                        percentage: 25,
                        color: theme.palette.secondary.main,
                      },
                      {
                        category: "Transportation",
                        amount: 535.5,
                        percentage: 15,
                        color: theme.palette.success.main,
                      },
                      {
                        category: "Entertainment",
                        amount: 535.5,
                        percentage: 15,
                        color: theme.palette.warning.main,
                      },
                      {
                        category: "Utilities",
                        amount: 357,
                        percentage: 10,
                        color: theme.palette.info.main,
                      },
                    ].map((expense) => (
                      <Box key={expense.category} sx={{ mb: 2.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.75,
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {expense.category}
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            ${expense.amount.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            bgcolor: "rgba(0,0,0,0.04)",
                            borderRadius: 5,
                            height: 7,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${expense.percentage}%`,
                              bgcolor: expense.color,
                              height: "100%",
                              borderRadius: 5,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </GridCompatibility>
                </GridCompatibility>
              </Paper>
            )}
          </Box>
        </GridCompatibility>

        {/* Sidebar */}
        <GridCompatibility item xs={12} md={4}>
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
                p: 2.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: `${theme.palette.primary.main}12`,
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                }}
              >
                <AccountIcon />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Quick Actions
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/transactions")}
              >
                New Transaction
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CreditCardIcon />}
                onClick={() =>
                  accountData && navigate(`/accounts/${accountData.accountId}`)
                }
              >
                Manage Account
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SavingsIcon />}
                onClick={() => navigate("/savings")}
              >
                Savings Goals
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<NotificationsIcon />}
              >
                Set Alerts
              </Button>
            </Box>
          </Paper>

          {/* Account Card */}
          {accountData && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                mb: 3,
                background: "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)",
                color: "white",
                p: 3,
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Account Balance
                </Typography>
                <AccountIcon sx={{ opacity: 0.7 }} />
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                $
                {accountData.balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {accountData.accountType} • ****
                {String(accountData.accountId).slice(-4)}
              </Typography>
              <Box
                sx={{
                  mt: 2.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {accountData.currency}
                </Typography>
                <Tooltip title="View full account details">
                  <Button
                    size="small"
                    onClick={() =>
                      navigate(`/accounts/${accountData.accountId}`)
                    }
                    sx={{
                      color: "white",
                      opacity: 0.9,
                      borderColor: "rgba(255,255,255,0.4)",
                      fontSize: "0.75rem",
                      border: "1px solid rgba(255,255,255,0.4)",
                      borderRadius: 2,
                    }}
                  >
                    Details
                  </Button>
                </Tooltip>
              </Box>
            </Paper>
          )}
        </GridCompatibility>
      </GridCompatibility>
    </Box>
  );
};

export default Dashboard;
