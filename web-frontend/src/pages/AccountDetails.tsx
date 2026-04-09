import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  accountAPI,
  transactionAPI,
  type Transaction,
  type Account,
} from "../services/api";

const AccountDetails: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accountData, setAccountData] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchAccountDetails = useCallback(async () => {
    if (!accountId) return;

    try {
      setLoading(true);
      setError(null);

      const [accountResponse, transactionsResponse] = await Promise.all([
        accountAPI.getAccountDetails(accountId),
        transactionAPI.getTransactions({ accountId }),
      ]);

      setAccountData(accountResponse.data);
      setTransactions(transactionsResponse.data || []);
    } catch (err) {
      console.error("Error fetching account details:", err);
      setError("Failed to load account details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);

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
        <CircularProgress aria-label="Loading account details" />
      </Box>
    );
  }

  if (error || !accountData) {
    return (
      <Box sx={{ mt: 4, p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || "Account not found."}
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2, borderRadius: 2 }}
          onClick={fetchAccountDetails}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const maskId = (id: string) => `****${id.slice(-4)}`;

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Account Details
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardHeader
              title="Account Information"
              titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
            />
            <Divider />
            <CardContent>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Holder
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {accountData.name || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {maskId(accountData.accountId)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {accountData.accountType}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Opening Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(accountData.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { sm: "1 / span 2" } }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {accountData.email || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: "1", sm: "1 / span 2" } }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Current Balance
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: accountData.currency || "USD",
                    }).format(accountData.balance)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardHeader
              title="Account Actions"
              titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
            />
            <Divider />
            <CardContent>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                  onClick={() => navigate("/transactions")}
                >
                  Transfer Money
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                  onClick={() => navigate("/transactions")}
                >
                  Deposit Funds
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                  onClick={() => navigate("/reports")}
                >
                  View Reports
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                  onClick={() => navigate("/savings")}
                >
                  Savings Goals
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
        >
          <CardHeader
            title="Transaction History"
            titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
            action={
              <Button color="primary" variant="text">
                Download CSV
              </Button>
            }
          />
          <Divider />
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {transactions.length > 0 ? (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: "action.hover" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const isCredit = transaction.transactionType === "CREDIT";
                      return (
                        <TableRow key={transaction.transactionId} hover>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.transactionType}
                              size="small"
                              sx={{
                                fontWeight: "bold",
                                bgcolor: isCredit
                                  ? "success.light"
                                  : "info.light",
                                color: isCredit ? "success.dark" : "info.dark",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                color: isCredit ? "success.main" : "error.main",
                              }}
                            >
                              {isCredit ? "+" : "-"}
                              {Math.abs(transaction.amount).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No transactions found for this account.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AccountDetails;
