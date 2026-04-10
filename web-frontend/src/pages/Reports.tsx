import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  Refresh as RefreshIcon,
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
  Snackbar,
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
import { useCallback, useEffect, useState } from "react";
import { reportAPI, type CreateReportData, type Report } from "../services/api";

const REPORT_TYPES = [
  {
    value: "ACCOUNT_SUMMARY",
    label: "Account Summary",
    description: "Overview of all your accounts",
  },
  {
    value: "TRANSACTION_HISTORY",
    label: "Transaction History",
    description: "Detailed list of all transactions",
  },
  {
    value: "SAVINGS_ANALYSIS",
    label: "Savings Analysis",
    description: "Progress toward savings goals",
  },
  {
    value: "LOAN_SUMMARY",
    label: "Loan Summary",
    description: "Active loans and repayment status",
  },
  {
    value: "MONTHLY_STATEMENT",
    label: "Monthly Statement",
    description: "Monthly income and expense summary",
  },
  {
    value: "ANNUAL_REPORT",
    label: "Annual Report",
    description: "Yearly financial overview",
  },
];

const Reports: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formValues, setFormValues] = useState<CreateReportData>({
    reportType: "ACCOUNT_SUMMARY",
    accountId: "",
    requestedBy: "",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => setSnackbar({ open: true, message, severity });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await reportAPI.getReports();
      setReports(response.data || []);
    } catch {
      setFetchError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSubmit = async () => {
    if (!formValues.reportType) {
      setSubmitError("Please select a report type");
      return;
    }
    try {
      setSubmitLoading(true);
      setSubmitError(null);
      const payload: CreateReportData = {
        reportType: formValues.reportType,
        accountId: formValues.accountId || undefined,
        requestedBy: formValues.requestedBy || undefined,
      };
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
      showSnackbar("Report generation started successfully!");
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

  const getStatusChip = (status: string) => {
    const configs: Record<string, { bg: string; color: string }> = {
      COMPLETED: {
        bg: `${theme.palette.success.main}15`,
        color: theme.palette.success.dark,
      },
      FAILED: {
        bg: `${theme.palette.error.main}15`,
        color: theme.palette.error.dark,
      },
      PENDING: {
        bg: `${theme.palette.warning.main}15`,
        color: theme.palette.warning.dark,
      },
    };
    const c = configs[status] || {
      bg: theme.palette.grey[200],
      color: theme.palette.grey[700],
    };
    return (
      <Chip
        icon={getStatusIcon(status)}
        label={status}
        size="small"
        sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, border: "none" }}
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

  const completedCount = reports.filter((r) => r.status === "COMPLETED").length;
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

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
            Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and download financial reports for your accounts
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchReports}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ py: 1.5, px: 3 }}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Summary Stats */}
      {reports.length > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {[
            {
              label: "Total Reports",
              value: reports.length,
              color: theme.palette.primary.main,
            },
            {
              label: "Completed",
              value: completedCount,
              color: theme.palette.success.main,
            },
            {
              label: "Pending",
              value: pendingCount,
              color: theme.palette.warning.main,
            },
          ].map((stat) => (
            <Paper
              key={stat.label}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                minWidth: 120,
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} color={stat.color}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {fetchError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button size="small" onClick={fetchReports}>
              Retry
            </Button>
          }
        >
          {fetchError}
        </Alert>
      )}

      {reports.length === 0 ? (
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
        >
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <AssessmentIcon
              sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.4 }}
            />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              No Reports Yet
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 380, mx: "auto" }}
            >
              Generate your first financial report to gain insights into your
              spending and savings.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              size="large"
            >
              Generate First Report
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
            sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Report History ({reports.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Generated At</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.reportId}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        fontFamily="monospace"
                      >
                        #{report.reportId.slice(-8).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {REPORT_TYPES.find((t) => t.value === report.reportType)
                          ?.label || report.reportType}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(report.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(report.generatedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {report.accountId || "All Accounts"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        disabled={report.status !== "COMPLETED"}
                        variant="outlined"
                        sx={{ fontSize: "0.75rem", py: 0.5 }}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Generate Report Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Generate New Report</DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <TextField
              label="Report Type"
              select
              fullWidth
              margin="normal"
              value={formValues.reportType}
              onChange={(e) =>
                setFormValues({ ...formValues, reportType: e.target.value })
              }
            >
              {REPORT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {type.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Account ID (optional)"
              fullWidth
              margin="normal"
              value={formValues.accountId || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, accountId: e.target.value })
              }
              placeholder="Leave blank to include all accounts"
            />
            <TextField
              label="Requested By (optional)"
              fullWidth
              margin="normal"
              value={formValues.requestedBy || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, requestedBy: e.target.value })
              }
              placeholder="Your name or reference"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitLoading}
          >
            {submitLoading ? "Generating..." : "Generate Report"}
          </Button>
        </DialogActions>
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

export default Reports;
