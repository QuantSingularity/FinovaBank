import {
  AccountBalance as BankIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  CreditScore as CreditIcon,
  Payment as PaymentIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { loanAPI, type Loan } from "../services/api";

const LOAN_TYPES = [
  { value: "PERSONAL", label: "Personal Loan", rate: 5.25 },
  { value: "EDUCATION", label: "Education Loan", rate: 4.5 },
  { value: "HOME", label: "Home Loan", rate: 3.75 },
  { value: "AUTO", label: "Auto Loan", rate: 4.25 },
];

const validationSchema = yup.object({
  loanAmount: yup
    .number()
    .typeError("Please enter a valid amount")
    .min(1000, "Loan amount must be at least $1,000")
    .max(100000, "Loan amount cannot exceed $100,000")
    .required("Loan amount is required"),
  loanType: yup.string().required("Loan type is required"),
  durationInMonths: yup
    .number()
    .typeError("Please enter a valid duration")
    .min(6, "Duration must be at least 6 months")
    .max(60, "Duration cannot exceed 60 months")
    .required("Duration is required"),
});

const Loans: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => setSnackbar({ open: true, message, severity });

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await loanAPI.getLoans();
      setLoans(response.data || []);
    } catch {
      setFetchError("Failed to load loans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSubmitError(null);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      loanAmount: 5000,
      loanType: "PERSONAL",
      durationInMonths: 12,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        const response = await loanAPI.applyForLoan({
          loanAmount: values.loanAmount,
          loanType: values.loanType,
          durationInMonths: values.durationInMonths,
        });
        if (response.data) {
          setLoans((prev) => [...prev, response.data]);
        }
        handleCloseDialog();
        showSnackbar("Loan application submitted successfully!");
      } catch (error: any) {
        setSubmitError(
          error.response?.data?.message ||
            "Failed to submit loan application. Please try again.",
        );
      }
    },
  });

  const selectedLoanType = LOAN_TYPES.find(
    (t) => t.value === formik.values.loanType,
  );
  const interestRate = (selectedLoanType?.rate ?? 5.25) / 100 / 12;
  const n = formik.values.durationInMonths;
  const p = formik.values.loanAmount;
  const estimatedMonthlyPayment =
    n > 0 && p > 0
      ? interestRate > 0
        ? (p * interestRate * Math.pow(1 + interestRate, n)) /
          (Math.pow(1 + interestRate, n) - 1)
        : p / n
      : 0;

  const getStatusChip = (status: string) => {
    const configs: Record<
      string,
      { color: string; bg: string; label: string }
    > = {
      APPROVED: {
        color: theme.palette.success.dark,
        bg: `${theme.palette.success.main}15`,
        label: "Approved",
      },
      PENDING: {
        color: theme.palette.warning.dark,
        bg: `${theme.palette.warning.main}15`,
        label: "Pending",
      },
      REJECTED: {
        color: theme.palette.error.dark,
        bg: `${theme.palette.error.main}15`,
        label: "Rejected",
      },
      PAID: {
        color: theme.palette.info.dark,
        bg: `${theme.palette.info.main}15`,
        label: "Paid",
      },
    };
    const config = configs[status] || {
      color: theme.palette.grey[700],
      bg: theme.palette.grey[200],
      label: status,
    };
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          fontWeight: 600,
          bgcolor: config.bg,
          color: config.color,
          border: "none",
        }}
      />
    );
  };

  const getLoanTypeChip = (loanType: string) => {
    const typeConfig = LOAN_TYPES.find((t) => t.value === loanType);
    return (
      <Chip
        label={typeConfig?.label || loanType}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 500, fontSize: "0.75rem" }}
      />
    );
  };

  const getRepaymentProgress = (loan: Loan) => {
    if (!loan.loanAmount || loan.loanAmount === 0) return 0;
    return Math.round(
      ((loan.loanAmount - loan.remainingAmount) / loan.loanAmount) * 100,
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

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)",
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
            Loan Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Apply for loans and track your repayment progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ py: 1.5, px: 3 }}
        >
          Apply for Loan
        </Button>
      </Box>

      {fetchError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button size="small" onClick={fetchLoans}>
              Retry
            </Button>
          }
        >
          {fetchError}
        </Alert>
      )}

      {loans.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {loans.map((loan) => {
            const repaymentProgress = getRepaymentProgress(loan);
            return (
              <Card
                key={loan.loanId}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 12px 28px rgba(15,23,42,0.08)",
                  },
                }}
              >
                <CardHeader
                  title={`Loan #${loan.loanId.slice(-6).toUpperCase()}`}
                  titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
                  subheader={getLoanTypeChip(loan.loanType)}
                  action={getStatusChip(loan.status)}
                />
                <Divider />
                <CardContent>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "rgba(37,99,235,0.04)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        <BankIcon
                          sx={{ fontSize: 14, color: "primary.main" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Loan Amount
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color="primary.main"
                      >
                        $
                        {loan.loanAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        <CreditIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Interest Rate
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700}>
                        {loan.interestRate}% p.a.
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        <PaymentIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Monthly Payment
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700}>
                        $
                        {loan.monthlyPayment.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        <TrendingDownIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Remaining
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700}>
                        $
                        {loan.remainingAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Repayment Progress */}
                  <Box sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Repayment Progress
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="primary.main"
                      >
                        {repaymentProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={repaymentProgress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        "& .MuiLinearProgress-bar": { borderRadius: 4 },
                      }}
                    />
                  </Box>

                  {(loan.approvalDate || loan.nextPaymentDate) && (
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                      {loan.approvalDate && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CalendarIcon
                            sx={{ fontSize: 13, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Approved:{" "}
                            {new Date(loan.approvalDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      {loan.nextPaymentDate && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CalendarIcon
                            sx={{ fontSize: 13, color: "warning.main" }}
                          />
                          <Typography
                            variant="caption"
                            color="warning.main"
                            fontWeight={500}
                          >
                            Next payment:{" "}
                            {new Date(
                              loan.nextPaymentDate,
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
        >
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <BankIcon
              sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.4 }}
            />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              No Active Loans
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 360, mx: "auto" }}
            >
              You don't have any active loans. Apply for a loan with competitive
              rates.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              size="large"
            >
              Apply for a Loan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loan Application Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Apply for a New Loan</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <TextField
                fullWidth
                id="loanType"
                name="loanType"
                label="Loan Type"
                select
                value={formik.values.loanType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.loanType && Boolean(formik.errors.loanType)
                }
                helperText={formik.touched.loanType && formik.errors.loanType}
                margin="normal"
              >
                {LOAN_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label} — {t.rate}% p.a.
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                id="loanAmount"
                name="loanAmount"
                label="Loan Amount ($)"
                type="number"
                inputProps={{ min: 1000, max: 100000, step: 500 }}
                value={formik.values.loanAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.loanAmount && Boolean(formik.errors.loanAmount)
                }
                helperText={
                  formik.touched.loanAmount && formik.errors.loanAmount
                }
                margin="normal"
              />
              <TextField
                fullWidth
                id="durationInMonths"
                name="durationInMonths"
                label="Duration (months)"
                type="number"
                inputProps={{ min: 6, max: 60, step: 6 }}
                value={formik.values.durationInMonths}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.durationInMonths &&
                  Boolean(formik.errors.durationInMonths)
                }
                helperText={
                  formik.touched.durationInMonths &&
                  formik.errors.durationInMonths
                }
                margin="normal"
              />

              {/* Estimated Payment Card */}
              <Box
                sx={{
                  bgcolor: "rgba(37,99,235,0.06)",
                  p: 2.5,
                  borderRadius: 3,
                  mt: 2,
                  border: `1px solid ${theme.palette.primary.light}30`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
                >
                  Estimated Monthly Payment
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  ${estimatedMonthlyPayment.toFixed(2)}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Rate: {selectedLoanType?.rate ?? 5.25}% p.a.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total: ${(estimatedMonthlyPayment * n).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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

export default Loans;
