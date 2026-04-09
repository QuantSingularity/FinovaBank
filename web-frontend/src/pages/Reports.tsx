import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { reportAPI, type Report } from "../services/api";

const REPORT_TYPES = [
  { value: "ACCOUNT_SUMMARY", label: "Account Summary" },
  { value: "TRANSACTION_HISTORY", label: "Transaction History" },
  { value: "SAVINGS_ANALYSIS", label: "Savings Analysis" },
  { value: "LOAN_SUMMARY", label: "Loan Summary" },
  { value: "MONTHLY_STATEMENT", label: "Monthly Statement" },
  { value: "ANNUAL_REPORT", label: "Annual Report" },
];

const Reports: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    reportType: "ACCOUNT_SUMMARY",
    accountId: "",
    requestedBy: "",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await reportAPI.getReports();
      setReports(response.data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setFetchError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formValues.reportType) {
      setSubmitError("Please select a report type");
      return;
    }
    try {
      setSubmitLoading(true);
      setSubmitError(null);
      const payload: any = { reportType: formValues.reportType };
      if (formValues.accountId)
        payload.accountId = parseInt(formValues.accountId);
      if (formValues.requestedBy) payload.requestedBy = formValues.requestedBy;

      const response = await reportAPI.createReport(payload);
      if (response.data) {
        setReports((prev) => [response.data, ...prev]);
      }
      setOpenDialog(false);
      setFormValues({
        reportType: "ACCOUNT_SUMMARY",
        accountId: "",
        requestedBy: "",
      });
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message ||
          "Failed to generate report. Please try again.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <CheckCircleIcon
            fontSize="small"
            sx={{ color: theme.palette.success.main }}
          />
        );
      case "FAILED":
        return (
          <ErrorIcon
            fontSize="small"
            sx={{ color: theme.palette.error.main }}
          />
        );
      default:
        return (
          <PendingIcon
            fontSize="small"
            sx={{ color: theme.palette.warning.main }}
          />
        );
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          bg: theme.palette.success.light,
          color: theme.palette.success.dark,
        };
      case "FAILED":
        return {
          bg: theme.palette.error.light,
          color: theme.palette.error.dark,
        };
      default:
        return {
          bg: theme.palette.warning.light,
          color: theme.palette.warning.dark,
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
            Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and view financial reports for your accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ py: 1.5, px: 3, fontWeight: 600 }}
        >
          Generate Report
        </Button>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {fetchError}
        </Alert>
      )}

      {reports.length === 0 ? (
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
        >
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <AssessmentIcon
              sx={{
                fontSize: 64,
                color: theme.palette.primary.main,
                mb: 2,
                opacity: 0.5,
              }}
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Reports Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Generate your first financial report to gain insights into your
              accounts.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Generate Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Report History ({reports.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Report ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Generated At</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Requested By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Account ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>#{report.id}</TableCell>
                    <TableCell>
                      {REPORT_TYPES.find((t) => t.value === report.reportType)
                        ?.label || report.reportType}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(report.status)}
                        label={report.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusChipColor(report.status).bg,
                          color: getStatusChipColor(report.status).color,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(report.generatedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{report.requestedBy || "-"}</TableCell>
                    <TableCell>{report.accountId || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Generate New Report
        </DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Report Type"
              select
              fullWidth
              value={formValues.reportType}
              onChange={(e) =>
                setFormValues({ ...formValues, reportType: e.target.value })
              }
            >
              {REPORT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Account ID (optional)"
              fullWidth
              type="number"
              value={formValues.accountId}
              onChange={(e) =>
                setFormValues({ ...formValues, accountId: e.target.value })
              }
            />
            <TextField
              label="Requested By (optional)"
              fullWidth
              value={formValues.requestedBy}
              onChange={(e) =>
                setFormValues({ ...formValues, requestedBy: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitLoading}
          >
            {submitLoading ? "Generating..." : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
