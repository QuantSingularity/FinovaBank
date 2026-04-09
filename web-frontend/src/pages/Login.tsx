import {
  Devices as DevicesIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import GridCompatibility from "../components/GridCompatibility";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const theme = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await login(email, password);
    } catch (err: any) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          width: "100%",
          maxWidth: 1000,
          boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left Side - Login Form */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              color="primary"
            >
              FinovaBank
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Please sign in to access your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              inputProps={{ "aria-label": "Email Address" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              inputProps={{ "aria-label": "Password" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 1,
                mb: 3,
              }}
            >
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                boxShadow: "0px 8px 16px rgba(51, 102, 255, 0.24)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>

            <Box sx={{ mt: 4, mb: 2 }}>
              <Divider>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 1 }}
                >
                  Or continue with
                </Typography>
              </Divider>
            </Box>

            <GridCompatibility container spacing={2}>
              <GridCompatibility xs={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ py: 1.5 }}
                  onClick={() => setError("Social login is not yet available.")}
                >
                  Google
                </Button>
              </GridCompatibility>
              <GridCompatibility xs={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ py: 1.5 }}
                  onClick={() => setError("Social login is not yet available.")}
                >
                  Facebook
                </Button>
              </GridCompatibility>
              <GridCompatibility xs={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ py: 1.5 }}
                  onClick={() => setError("Social login is not yet available.")}
                >
                  Apple
                </Button>
              </GridCompatibility>
            </GridCompatibility>
          </Box>
        </Box>

        {/* Right Side - Info Panel */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "primary.main",
            color: "white",
            p: 4,
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            Banking Made Simple
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Access all your financial services in one place with our secure and
            user-friendly platform.
          </Typography>

          <Box sx={{ mb: 4 }}>
            <GridCompatibility container spacing={2}>
              <GridCompatibility xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <LockIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Secure Banking
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Bank with confidence using our advanced security features
                    </Typography>
                  </Box>
                </Box>
              </GridCompatibility>

              <GridCompatibility xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <TrendingUpIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Financial Insights
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Get personalized insights to improve your financial health
                    </Typography>
                  </Box>
                </Box>
              </GridCompatibility>

              <GridCompatibility xs={12}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <DevicesIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Anywhere, Anytime
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Access your accounts from any device, whenever you need
                    </Typography>
                  </Box>
                </Box>
              </GridCompatibility>
            </GridCompatibility>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
