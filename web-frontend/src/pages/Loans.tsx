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
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { loanAPI } from "../services/api";

const validationSchema = yup.object({
  loanAmount: yup
    .number()
    .min(1000, "Loan amount must be at least $1,000")
    .max(100000, "Loan amount cannot exceed $100,000")
    .required("Loan amount is required"),
  loanType: yup.string().required("Loan type is required"),
  durationInMonths: yup
    .number()
    .min(6, "Duration must be at least 6 months")
    .max(60, "Duration cannot exceed 60 months")
    .required("Duration is required"),
});

const Loans: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const response = await loanAPI.getLoans();
        setLoans(response.data || []);
      } catch (error) {
        console.error("Error fetching loans:", error);
        setFetchError("Failed to load loans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

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
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setSubmitError(null);
        const response = await loanAPI.applyForLoan({
          loanAmount: values.loanAmount,
          loanType: values.loanType,
          durationInMonths: values.durationInMonths,
        });

        if (response.data) {
          setLoans([...loans, response.data]);
        }

        handleCloseDialog();
      } catch (error: any) {
        console.error("Error applying for loan:", error);
        setSubmitError(
          error.response?.data?.message || "Failed to submit loan application.",
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const getLoanTypeChipColor = (loanType: string) => {
    switch (loanType) {
      case "PERSONAL":
        return {
          bg: theme.palette.primary.light,
          color: theme.palette.primary.dark,
        };
      case "EDUCATION":
        return {
          bg: theme.palette.secondary.light,
          color: theme.palette.secondary.dark,
        };
      case "HOME":
        return {
          bg: theme.palette.success.light,
          color: theme.palette.success.dark,
        };
      case "AUTO":
        return {
          bg: theme.palette.info.light,
          color: theme.palette.info.dark,
        };
      default:
        return {
          bg: theme.palette.grey[200],
          color: theme.palette.grey[800],
        };
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: theme.palette.success.light,
          color: theme.palette.success.dark,
        };
      case "PENDING":
        return {
          bg: theme.palette.warning.light,
          color: theme.palette.warning.dark,
        };
      case "REJECTED":
        return {
          bg: theme.palette.error.light,
          color: theme.palette.error.dark,
        };
      default:
        return {
          bg: theme.palette.grey[200],
          color: theme.palette.grey[800],
        };
    }
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

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Loan Management
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenDialog}
          sx={{ py: 1.5, px: 3 }}
        >
          Apply for New Loan
        </Button>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
          {loans.map((loan) => (
            <Card
              key={loan.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardHeader
                title={`Loan #${loan.id}`}
                titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
                action={
                  <Chip
                    label={loan.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusChipColor(loan.status).bg,
                      color: getStatusChipColor(loan.status).color,
                    }}
                  />
                }
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
                      Loan Type
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={loan.loanType}
                        size="small"
                        sx={{
                          bgcolor: getLoanTypeChipColor(loan.loanType).bg,
                          color: getLoanTypeChipColor(loan.loanType).color,
                        }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Loan Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      $
                      {loan.loanAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Interest Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {loan.interestRate}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {loan.durationInMonths} months
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Payment
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      $
                      {loan.monthlyPayment.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Remaining Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      $
                      {loan.remainingAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                  {loan.approvalDate && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Approval Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {loan.approvalDate}
                      </Typography>
                    </Box>
                  )}
                  {loan.nextPaymentDate && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Next Payment Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {loan.nextPaymentDate}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{ gridColumn: { xs: "1", sm: "1 / span 2" }, mt: 1 }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() =>
                        alert(
                          `Loan #${loan.id} - ${loan.loanType} loan for $${loan.loanAmount.toLocaleString()}`,
                        )
                      }
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
        >
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              No Active Loans
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You don't have any active loans at the moment.
            </Typography>
            <Button variant="contained" onClick={handleOpenDialog}>
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
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Apply for a New Loan
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}
            <Box sx={{ display: "grid", gap: 2 }}>
              <TextField
                fullWidth
                id="loanType"
                name="loanType"
                label="Loan Type"
                select
                value={formik.values.loanType}
                onChange={formik.handleChange}
                error={
                  formik.touched.loanType && Boolean(formik.errors.loanType)
                }
                helperText={formik.touched.loanType && formik.errors.loanType}
                margin="normal"
              >
                <MenuItem value="PERSONAL">Personal Loan</MenuItem>
                <MenuItem value="EDUCATION">Education Loan</MenuItem>
                <MenuItem value="HOME">Home Loan</MenuItem>
                <MenuItem value="AUTO">Auto Loan</MenuItem>
              </TextField>
              <TextField
                fullWidth
                id="loanAmount"
                name="loanAmount"
                label="Loan Amount ($)"
                type="number"
                value={formik.values.loanAmount}
                onChange={formik.handleChange}
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
                value={formik.values.durationInMonths}
                onChange={formik.handleChange}
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
              <Box
                sx={{
                  bgcolor: theme.palette.grey[100],
                  p: 2,
                  borderRadius: 1,
                  mt: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Estimated Monthly Payment
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  $
                  {(
                    (formik.values.loanAmount /
                      formik.values.durationInMonths) *
                    (1 +
                      (formik.values.loanType === "PERSONAL" ? 0.0525 : 0.045) /
                        12)
                  ).toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Interest Rate:{" "}
                  {formik.values.loanType === "PERSONAL" ? "5.25%" : "4.5%"}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit Application
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Loans;
