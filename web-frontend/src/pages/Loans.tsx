import {
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
  const [loans, setLoans] = useState([
    {
      id: 1001,
      loanAmount: 10000.0,
      loanType: "PERSONAL",
      interestRate: 5.25,
      durationInMonths: 24,
      monthlyPayment: 438.71,
      remainingAmount: 8500.5,
      status: "APPROVED",
      approvalDate: "2025-01-15",
      nextPaymentDate: "2025-05-15",
    },
    {
      id: 1002,
      loanAmount: 5000.0,
      loanType: "EDUCATION",
      interestRate: 4.5,
      durationInMonths: 12,
      monthlyPayment: 428.04,
      remainingAmount: 2140.2,
      status: "APPROVED",
      approvalDate: "2024-10-05",
      nextPaymentDate: "2025-05-05",
    },
  ]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const response = await loanAPI.getLoans();
        if (response.data && response.data.length > 0) {
          setLoans(response.data);
        }
      } catch (error) {
        console.error("Error fetching loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
        const response = await loanAPI.applyForLoan({
          loanAmount: values.loanAmount,
          loanType: values.loanType,
          durationInMonths: values.durationInMonths,
        });

        if (response.data) {
          setLoans([...loans, response.data]);
        } else {
          // If API doesn't return the new loan, create a mock one
          const newLoan = {
            id: Math.floor(1000 + Math.random() * 9000),
            loanAmount: values.loanAmount,
            loanType: values.loanType,
            interestRate: values.loanType === "PERSONAL" ? 5.25 : 4.5,
            durationInMonths: values.durationInMonths,
            monthlyPayment:
              (values.loanAmount / values.durationInMonths) *
              (1 + (values.loanType === "PERSONAL" ? 0.0525 : 0.045) / 12),
            remainingAmount: values.loanAmount,
            status: "PENDING",
            approvalDate: "",
            nextPaymentDate: "",
          };

          setLoans([...loans, newLoan]);
        }

        handleCloseDialog();
      } catch (error) {
        console.error("Error applying for loan:", error);
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
                    <Button variant="outlined" fullWidth>
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
