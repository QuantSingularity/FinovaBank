import {
  Add as AddIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  AttachMoney as AttachMoneyIcon,
  DateRange as DateRangeIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  SwapHoriz as SwapHorizIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import GridCompatibility from "../components/GridCompatibility";
import { transactionAPI, type Transaction } from "../services/api";

const Transactions: React.FC = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferForm, setTransferForm] = useState({
    type: "DEPOSIT",
    amount: "",
    description: "",
    accountId: "",
  });
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => setSnackbar({ open: true, message, severity });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionAPI.getTransactions();
      setTransactions(response.data || []);
    } catch {
      setError("Failed to load transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === 1 && t.transactionType !== "CREDIT") return false;
    if (activeTab === 2 && t.transactionType !== "DEBIT") return false;
    if (activeTab === 3 && t.transactionType !== "TRANSFER") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.amount?.toString().includes(q) ||
        t.transactionId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleTransferSubmit = async () => {
    if (
      !transferForm.amount ||
      !transferForm.description ||
      !transferForm.accountId
    ) {
      setTransferError("Please fill in all required fields");
      return;
    }
    const amount = parseFloat(transferForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setTransferError("Please enter a valid amount greater than 0");
      return;
    }
    try {
      setTransferLoading(true);
      setTransferError(null);
      const response = await transactionAPI.createTransaction({
        type: transferForm.type as "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
        amount,
        description: transferForm.description,
        accountId: transferForm.accountId,
      });
      if (response.data) {
        setTransactions((prev) => [response.data, ...prev]);
      }
      setShowTransferDialog(false);
      setTransferForm({
        type: "DEPOSIT",
        amount: "",
        description: "",
        accountId: "",
      });
      showSnackbar("Transaction submitted successfully!");
    } catch (err: any) {
      setTransferError(
        err.response?.data?.message || "Transaction failed. Please try again.",
      );
    } finally {
      setTransferLoading(false);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    transaction: Transaction,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const getTransactionIcon = (type: string) => {
    if (type === "CREDIT") return <ArrowUpwardIcon />;
    if (type === "TRANSFER") return <SwapHorizIcon />;
    return <ArrowDownwardIcon />;
  };

  const getStatusChip = (status: string) => {
    const configs: Record<
      string,
      { color: "success" | "warning" | "error" | "default" }
    > = {
      COMPLETED: { color: "success" },
      PENDING: { color: "warning" },
      FAILED: { color: "error" },
    };
    return (
      <Chip
        label={status}
        size="small"
        color={configs[status]?.color ?? "default"}
        variant="outlined"
        sx={{ fontSize: "0.7rem", height: 22 }}
      />
    );
  };

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

  const totalIncome = transactions
    .filter((t) => t.transactionType === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.transactionType === "DEBIT")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.08) 100%)",
          border: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Transactions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all your account transactions
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AttachMoneyIcon />}
            onClick={() => setShowTransferDialog(true)}
          >
            New Transaction
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <GridCompatibility container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Total Transactions",
            value: transactions.length.toString(),
            color: theme.palette.primary.main,
          },
          {
            label: "Total Income",
            value: `$${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            color: theme.palette.success.main,
          },
          {
            label: "Total Expenses",
            value: `$${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            color: theme.palette.error.main,
          },
          {
            label: "Net Flow",
            value: `${totalIncome - totalExpenses >= 0 ? "+" : ""}$${Math.abs(totalIncome - totalExpenses).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            color:
              totalIncome >= totalExpenses
                ? theme.palette.success.main
                : theme.palette.error.main,
          },
        ].map((stat) => (
          <GridCompatibility item xs={6} md={3} key={stat.label}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                {stat.label}
              </Typography>
              <Typography variant="h6" fontWeight={700} color={stat.color}>
                {stat.value}
              </Typography>
            </Paper>
          </GridCompatibility>
        ))}
      </GridCompatibility>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchTransactions}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          mb: 2,
        }}
      >
        <GridCompatibility container spacing={2} alignItems="center">
          <GridCompatibility item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by description, category, or amount..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </GridCompatibility>
          <GridCompatibility item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<DateRangeIcon />}
                size="small"
              >
                Date Range
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                size="small"
              >
                Filters
              </Button>
            </Box>
          </GridCompatibility>
        </GridCompatibility>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 2,
          "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
        }}
      >
        <Tab label={`All (${transactions.length})`} sx={{ fontWeight: 500 }} />
        <Tab
          label={`Income (${transactions.filter((t) => t.transactionType === "CREDIT").length})`}
          sx={{ fontWeight: 500 }}
        />
        <Tab
          label={`Expenses (${transactions.filter((t) => t.transactionType === "DEBIT").length})`}
          sx={{ fontWeight: 500 }}
        />
        <Tab
          label={`Transfers (${transactions.filter((t) => t.transactionType === "TRANSFER").length})`}
          sx={{ fontWeight: 500 }}
        />
      </Tabs>

      {/* Transaction List */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </Typography>
        </Box>

        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <Box
              key={transaction.transactionId}
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                "&:last-child": { borderBottom: "none" },
                "&:hover": { bgcolor: "rgba(0,0,0,0.01)" },
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor:
                      transaction.transactionType === "CREDIT"
                        ? `${theme.palette.success.main}14`
                        : transaction.transactionType === "TRANSFER"
                          ? `${theme.palette.info.main}14`
                          : `${theme.palette.error.main}14`,
                    color:
                      transaction.transactionType === "CREDIT"
                        ? theme.palette.success.main
                        : transaction.transactionType === "TRANSFER"
                          ? theme.palette.info.main
                          : theme.palette.error.main,
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  {getTransactionIcon(transaction.transactionType)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {transaction.description ||
                      `Transaction #${transaction.transactionId}`}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.4,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography>
                    {transaction.category && (
                      <Chip
                        label={transaction.category}
                        size="small"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                    {getStatusChip(transaction.status)}
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 2,
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={
                    transaction.transactionType === "CREDIT"
                      ? "success.main"
                      : "error.main"
                  }
                  sx={{ mr: 1.5 }}
                >
                  {transaction.transactionType === "CREDIT" ? "+" : "-"}$
                  {Math.abs(transaction.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, transaction)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <ReceiptIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery
                ? "No transactions match your search"
                : "No transactions found"}
            </Typography>
            {!searchQuery && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowTransferDialog(true)}
                sx={{ mt: 1 }}
              >
                Add First Transaction
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* New Transaction Dialog */}
      <Dialog
        open={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>New Transaction</DialogTitle>
        <DialogContent>
          {transferError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {transferError}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={transferForm.type}
                label="Transaction Type"
                onChange={(e) =>
                  setTransferForm({ ...transferForm, type: e.target.value })
                }
              >
                <MenuItem value="DEPOSIT">💰 Deposit</MenuItem>
                <MenuItem value="WITHDRAWAL">💸 Withdrawal</MenuItem>
                <MenuItem value="TRANSFER">🔁 Transfer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Account ID"
              value={transferForm.accountId}
              onChange={(e) =>
                setTransferForm({ ...transferForm, accountId: e.target.value })
              }
              fullWidth
              margin="normal"
              placeholder="Enter your account ID"
              required
            />
            <TextField
              label="Amount ($)"
              type="number"
              inputProps={{ min: 0.01, step: 0.01 }}
              value={transferForm.amount}
              onChange={(e) =>
                setTransferForm({ ...transferForm, amount: e.target.value })
              }
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              value={transferForm.description}
              onChange={(e) =>
                setTransferForm({
                  ...transferForm,
                  description: e.target.value,
                })
              }
              fullWidth
              margin="normal"
              multiline
              rows={2}
              placeholder="What's this transaction for?"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setShowTransferDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTransferSubmit}
            disabled={transferLoading}
          >
            {transferLoading ? "Processing..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Row Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 160,
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Category</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Transactions;
