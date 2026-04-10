import { Email as EmailIcon, Lock as LockIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@mui/material";

const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%)",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 4,
          maxWidth: 440,
          width: "100%",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0px 20px 60px rgba(15,23,42,0.1)",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <LockIcon sx={{ color: "white", fontSize: 28 }} />
        </Box>

        {!submitted ? (
          <>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              Forgot Password?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Enter your email and we'll send you a reset link.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, py: 1.75, fontWeight: 700 }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              Check Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              We sent a password reset link to <strong>{email}</strong>. Please
              check your inbox.
            </Typography>
            <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
              Reset link sent successfully!
            </Alert>
          </>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Remember your password?{" "}
          <Link
            component={RouterLink}
            to="/login"
            sx={{ color: "primary.main", fontWeight: 600 }}
          >
            Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
