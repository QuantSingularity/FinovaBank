import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Savings as SavingsIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { savingsAPI } from "../services/api";

const validationSchema = yup.object({
  goalName: yup.string().required("Goal name is required"),
  targetAmount: yup
    .number()
    .min(100, "Target amount must be at least $100")
    .required("Target amount is required"),
  targetDate: yup
    .date()
    .min(new Date(), "Target date must be in the future")
    .required("Target date is required"),
});

const SavingsGoals: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [savingsGoals, setSavingsGoals] = useState([
    {
      id: 1,
      goalName: "Vacation Fund",
      targetAmount: 5000.0,
      currentAmount: 2500.0,
      targetDate: "2025-12-31",
      createdDate: "2025-01-15",
      progress: 50,
    },
    {
      id: 2,
      goalName: "Emergency Fund",
      targetAmount: 10000.0,
      currentAmount: 8000.0,
      targetDate: "2025-08-30",
      createdDate: "2024-10-05",
      progress: 80,
    },
    {
      id: 3,
      goalName: "New Laptop",
      targetAmount: 2000.0,
      currentAmount: 500.0,
      targetDate: "2025-06-15",
      createdDate: "2025-03-01",
      progress: 25,
    },
  ]);

  useEffect(() => {
    const fetchSavingsGoals = async () => {
      try {
        setLoading(true);
        const response = await savingsAPI.getSavingsGoals();
        if (response.data && response.data.length > 0) {
          setSavingsGoals(response.data);
        }
      } catch (error) {
        console.error("Error fetching savings goals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavingsGoals();
  }, []);

  const handleOpenDialog = (goalId?: number) => {
    if (goalId) {
      setEditingGoalId(goalId);
      const goal = savingsGoals.find((g) => g.id === goalId);
      if (goal) {
        formik.setValues({
          goalName: goal.goalName,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate,
        });
      }
    } else {
      setEditingGoalId(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoalId(null);
    formik.resetForm();
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await savingsAPI.deleteSavingsGoal(goalId);
      setSavingsGoals(savingsGoals.filter((goal) => goal.id !== goalId));
    } catch (error) {
      console.error("Error deleting savings goal:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      goalName: "",
      targetAmount: 1000,
      targetDate: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (editingGoalId) {
          // Update existing goal
          const response = await savingsAPI.updateSavingsGoal(
            editingGoalId,
            values,
          );
          if (response.data) {
            setSavingsGoals(
              savingsGoals.map((goal) =>
                goal.id === editingGoalId ? response.data : goal,
              ),
            );
          } else {
            // If API doesn't return updated goal, update locally
            setSavingsGoals(
              savingsGoals.map((goal) =>
                goal.id === editingGoalId
                  ? {
                      ...goal,
                      goalName: values.goalName,
                      targetAmount: values.targetAmount,
                      targetDate: values.targetDate,
                    }
                  : goal,
              ),
            );
          }
        } else {
          // Create new goal
          const response = await savingsAPI.createSavingsGoal(values);
          if (response.data) {
            setSavingsGoals([...savingsGoals, response.data]);
          } else {
            // If API doesn't return the new goal, create a mock one
            const newGoal = {
              id: Math.floor(1 + Math.random() * 1000),
              goalName: values.goalName,
              targetAmount: values.targetAmount,
              currentAmount: 0,
              targetDate: values.targetDate,
              createdDate: new Date().toISOString().split("T")[0],
              progress: 0,
            };

            setSavingsGoals([...savingsGoals, newGoal]);
          }
        }

        handleCloseDialog();
      } catch (error) {
        console.error("Error saving goal:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleContribute = async (goalId: number, amount: number) => {
    try {
      // In a real app, this would call an API endpoint to contribute to the goal
      setSavingsGoals(
        savingsGoals.map((goal) => {
          if (goal.id === goalId) {
            const newCurrentAmount = goal.currentAmount + amount;
            const newProgress = Math.min(
              100,
              Math.round((newCurrentAmount / goal.targetAmount) * 100),
            );

            return {
              ...goal,
              currentAmount: newCurrentAmount,
              progress: newProgress,
            };
          }
          return goal;
        }),
      );
    } catch (error) {
      console.error("Error contributing to goal:", error);
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
          Savings Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ py: 1.5, px: 3 }}
        >
          Create New Goal
        </Button>
      </Box>

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
          {savingsGoals.map((goal) => (
            <Card
              key={goal.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardHeader
                title={goal.goalName}
                titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
                action={
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(goal.id)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ mb: 3 }}>
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
                    <Typography variant="body2" fontWeight="medium">
                      {goal.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={goal.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: theme.palette.grey[200],
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        bgcolor:
                          goal.progress === 100
                            ? theme.palette.success.main
                            : theme.palette.primary.main,
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      $
                      {goal.currentAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Target Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      $
                      {goal.targetAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {goal.createdDate}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Target Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {goal.targetDate}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleContribute(goal.id, 100)}
                    disabled={goal.progress === 100}
                  >
                    Add $100
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleContribute(goal.id, 500)}
                    disabled={goal.progress === 100}
                  >
                    Add $500
                  </Button>
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
            <SavingsIcon
              sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 2 }}>
              No Savings Goals
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You don't have any savings goals at the moment.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Savings Goal Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingGoalId ? "Edit Savings Goal" : "Create New Savings Goal"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2 }}>
              <TextField
                fullWidth
                id="goalName"
                name="goalName"
                label="Goal Name"
                value={formik.values.goalName}
                onChange={formik.handleChange}
                error={
                  formik.touched.goalName && Boolean(formik.errors.goalName)
                }
                helperText={formik.touched.goalName && formik.errors.goalName}
                margin="normal"
              />
              <TextField
                fullWidth
                id="targetAmount"
                name="targetAmount"
                label="Target Amount ($)"
                type="number"
                value={formik.values.targetAmount}
                onChange={formik.handleChange}
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
                error={
                  formik.touched.targetDate && Boolean(formik.errors.targetDate)
                }
                helperText={
                  formik.touched.targetDate && formik.errors.targetDate
                }
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingGoalId ? "Update Goal" : "Create Goal"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SavingsGoals;
