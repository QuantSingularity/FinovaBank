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
  Paper,
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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { accountAPI, transactionAPI } from "../services/api";

const AccountDetails: React.FC = () => {
  const { accountId } = useParams();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState({
    accountId: 0,
    name: "",
    email: "",
    balance: 0,
    accountNumber: "",
    accountType: "",
    createdDate: "",
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch account details
        const accountResponse = await accountAPI.getAccountDetails(accountId);
        const account = accountResponse.data;

        setAccountData({
          accountId: account.accountId,
          name: account.name,
          email: account.email,
          balance: account.balance,
          accountNumber: `****${account.accountId.toString().slice(-4)}`,
          accountType: account.accountType,
          createdDate:
            account.createdDate || new Date().toISOString().split("T")[0],
        });

        // Fetch account transactions
        const transactionsResponse = await transactionAPI.getTransactions({
          accountId,
        });
        setTransactions(transactionsResponse.data || []);
      } catch (err) {
        console.error("Error fetching account details:", err);
        setError("Failed to load account details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchAccountDetails();
    }
  }, [accountId]);

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
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Account Details
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Account Information Card */}
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
                    {accountData.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {accountData.accountNumber}
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
                    {accountData.createdDate}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {accountData.email}
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
                    $
                    {accountData.balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
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
                <Button variant="contained" fullWidth sx={{ py: 1.5 }}>
                  Transfer Money
                </Button>
                <Button variant="outlined" fullWidth sx={{ py: 1.5 }}>
                  Deposit Funds
                </Button>
                <Button variant="outlined" fullWidth sx={{ py: 1.5 }}>
                  Download Statement
                </Button>
                <Button variant="outlined" fullWidth sx={{ py: 1.5 }}>
                  Account Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Transaction History Card */}
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
        >
          <CardHeader
            title="Transaction History"
            titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
            action={<Button color="primary">Download CSV</Button>}
          />
          <Divider />
          <CardContent>
            {transactions.length > 0 ? (
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow
                        key={transaction.transactionId}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {transaction.description ||
                            `Transaction #${transaction.transactionId}`}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.transactionType}
                            size="small"
                            sx={{
                              bgcolor:
                                transaction.transactionType === "CREDIT"
                                  ? theme.palette.success.light
                                  : theme.palette.info.light,
                              color:
                                transaction.transactionType === "CREDIT"
                                  ? theme.palette.success.dark
                                  : theme.palette.info.dark,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            size="small"
                            sx={{
                              bgcolor: theme.palette.success.light,
                              color: theme.palette.success.dark,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color:
                                transaction.transactionType === "CREDIT"
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                            }}
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
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
