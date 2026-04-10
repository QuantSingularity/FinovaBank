import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Savings as SavingsIcon,
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
  IconButton,
  LinearProgress,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { savingsAPI, type SavingsGoal } from "../services/api";

const validationSchema = yup.object({
  goalName: yup.string().required("Goal name is required"),
  targetAmount: yup
    .number()
    .typeError("Target amount must be a number")
    .min(100, "Target amount must be at least $100")
    .required("Target amount is required"),
  targetDate: yup
    .date()
    .typeError("Please enter a valid date")
    .min(new Date(), "Target date must be in the future")
    .required("Target date is required"),
  description: yup.string(),
});

const SavingsGoalsPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => setSnackbar({ open: true, message, severity });

  const fetchSavingsGoals = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await savingsAPI.getSavingsGoals();
      setSavingsGoals(response.data || []);
    } catch {
      setFetchError("Failed to load savings goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingsGoals();
  }, []);

  const formik = useFormik({
    initialValues: {
      goalName: "",
      targetAmount: 1000,
      targetDate: "",
      description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        if (editingGoal) {
          const response = await savingsAPI.updateSavingsGoal(
            editingGoal.goalId,
            {
              goalName: values.goalName,
              targetAmount: values.targetAmount,
              targetDate: values.targetDate,
              description: values.description,
            },
          );
          if (response.data) {
            setSavingsGoals((prev) =>
              prev.map((g) =>
                g.goalId === editingGoal.goalId ? response.data : g,
              ),
            );
          } else {
            setSavingsGoals((prev) =>
              prev.map((g) =>
                g.goalId === editingGoal.goalId ? { ...g, ...values } : g,
              ),
            );
          }
          showSnackbar("Goal updated successfully!");
        } else {
          const response = await savingsAPI.createSavingsGoal({
            goalName: values.goalName,
            targetAmount: values.targetAmount,
            targetDate: values.targetDate,
            description: values.description,
          });
          if (response.data) {
            setSavingsGoals((prev) => [...prev, response.data]);
          }
          showSnackbar("Goal created successfully!");
        }
        handleCloseDialog();
      } catch (error: any) {
        setSubmitError(
          error.response?.data?.message ||
            "Failed to save goal. Please try again.",
        );
      }
    },
  });

  const handleOpenDialog = (goal?: SavingsGoal) => {
    setSubmitError(null);
    if (goal) {
      setEditingGoal(goal);
      formik.setValues({
        goalName: goal.goalName,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        description: goal.description || "",
      });
    } else {
      setEditingGoal(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
    setSubmitError(null);
    formik.resetForm();
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await savingsAPI.deleteSavingsGoal(goalId);
      setSavingsGoals((prev) => prev.filter((g) => g.goalId !== goalId));
      showSnackbar("Goal deleted.");
    } catch {
      showSnackbar("Failed to delete goal.", "error");
    }
  };

  const handleContribute = async (goal: SavingsGoal, amount: number) => {
    const newCurrentAmount = Math.min(
      goal.currentAmount + amount,
      goal.targetAmount,
    );
    try {
      await savingsAPI.updateSavingsGoal(goal.goalId, {
        goalName: goal.goalName,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
      });
      setSavingsGoals((prev) =>
        prev.map((g) =>
          g.goalId === goal.goalId
            ? { ...g, currentAmount: newCurrentAmount }
            : g,
        ),
      );
      showSnackbar(`Added $${amount} to "${goal.goalName}"!`);
    } catch {
      setSavingsGoals((prev) =>
        prev.map((g) =>
          g.goalId === goal.goalId
            ? { ...g, currentAmount: newCurrentAmount }
            : g,
        ),
      );
      showSnackbar(`Added $${amount} to "${goal.goalName}"!`);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return theme.palette.success.main;
    if (progress >= 60) return theme.palette.primary.main;
    if (progress >= 30) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getDaysLeft = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
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
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Savings Goals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your financial goals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ py: 1.5, px: 3 }}
        >
          Create New Goal
        </Button>
      </Box>

      {fetchError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button size="small" onClick={fetchSavingsGoals}>
              Retry
            </Button>
          }
        >
          {fetchError}
        </Alert>
      )}

      {savingsGoals.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
              lg: "1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          {savingsGoals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? Math.min(
                    100,
                    Math.round((goal.currentAmount / goal.targetAmount) * 100),
                  )
                : 0;
            const daysLeft = getDaysLeft(goal.targetDate);
            const isCompleted = progress >= 100 || goal.status === "COMPLETED";

            return (
              <Card
                key={goal.goalId}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${isCompleted ? theme.palette.success.light : theme.palette.divider}`,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 12px 28px rgba(15,23,42,0.08)",
                  },
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {goal.goalName}
                      {isCompleted && (
                        <CheckCircleIcon
                          sx={{ color: "success.main", fontSize: 18 }}
                        />
                      )}
                    </Box>
                  }
                  titleTypographyProps={{
                    variant: "h6",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                  subheader={goal.description}
                  subheaderTypographyProps={{ variant: "caption" }}
                  action={
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(goal)}
                        sx={{ mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGoal(goal.goalId)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={getProgressColor(progress)}
                      >
                        {progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: theme.palette.grey[200],
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          bgcolor: getProgressColor(progress),
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "rgba(37,99,235,0.04)",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Saved
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="primary.main"
                      >
                        $
                        {goal.currentAmount.toLocaleString("en-US", {
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
                      <Typography variant="caption" color="text.secondary">
                        Target
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        $
                        {goal.targetAmount.toLocaleString("en-US", {
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
                      <Typography variant="caption" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(goal.targetDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor:
                          daysLeft < 30
                            ? `${theme.palette.warning.main}10`
                            : "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Days Left
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={daysLeft < 30 ? "warning.main" : "text.primary"}
                      >
                        {daysLeft > 0 ? `${daysLeft} days` : "Overdue"}
                      </Typography>
                    </Box>
                  </Box>

                  {!isCompleted && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        onClick={() => handleContribute(goal, 100)}
                        disabled={goal.currentAmount >= goal.targetAmount}
                      >
                        +$100
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        onClick={() => handleContribute(goal, 500)}
                        disabled={goal.currentAmount >= goal.targetAmount}
                      >
                        +$500
                      </Button>
                    </Box>
                  )}
                  {isCompleted && (
                    <Chip
                      label="Goal Achieved! 🎉"
                      color="success"
                      size="small"
                      sx={{ width: "100%", borderRadius: 2 }}
                    />
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
            <SavingsIcon
              sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.5 }}
            />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              No Savings Goals Yet
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 360, mx: "auto" }}
            >
              Set a financial goal and start saving today. Every dollar counts!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              size="large"
            >
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingGoal ? "Edit Savings Goal" : "Create New Savings Goal"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <TextField
                fullWidth
                id="goalName"
                name="goalName"
                label="Goal Name"
                value={formik.values.goalName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.goalName && Boolean(formik.errors.goalName)
                }
                helperText={formik.touched.goalName && formik.errors.goalName}
                margin="normal"
                placeholder="e.g. Vacation Fund, Emergency Fund"
              />
              <TextField
                fullWidth
                id="targetAmount"
                name="targetAmount"
                label="Target Amount ($)"
                type="number"
                inputProps={{ min: 100, step: 50 }}
                value={formik.values.targetAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.targetAmount &&
                  Boolean(formik.errors.targetAmount)
                }
                helperText={
                  formik.touched.targetAmount && formik.errors.targetAmount
                }
                margin="normal"
              />
              <TextField
                fullWidth
                id="targetDate"
                name="targetDate"
                label="Target Date"
                type="date"
                value={formik.values.targetDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.targetDate && Boolean(formik.errors.targetDate)
                }
                helperText={
                  formik.touched.targetDate && formik.errors.targetDate
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description (optional)"
                value={formik.values.description}
                onChange={formik.handleChange}
                multiline
                rows={2}
                margin="normal"
                placeholder="Why are you saving for this goal?"
              />
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
              {formik.isSubmitting
                ? "Saving..."
                : editingGoal
                  ? "Update Goal"
                  : "Create Goal"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
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

export default SavingsGoalsPage;
