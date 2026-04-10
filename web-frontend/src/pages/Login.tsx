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
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const theme = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
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

  const features = [
    {
      icon: <LockIcon />,
      title: "Secure Banking",
      desc: "Bank with confidence using advanced security",
    },
    {
      icon: <TrendingUpIcon />,
      title: "Financial Insights",
      desc: "Get personalized insights to improve your finances",
    },
    {
      icon: <DevicesIcon />,
      title: "Anywhere, Anytime",
      desc: "Access your accounts from any device",
    },
  ];

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
          borderRadius: 4,
          overflow: "hidden",
          width: "100%",
          maxWidth: 1000,
          boxShadow: "0px 20px 60px rgba(15, 23, 42, 0.12)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Left: Login Form */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 5, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={800}
              color="primary.main"
              letterSpacing="-0.02em"
            >
              FinovaBank
            </Typography>
          </Box>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mb: 0.75, letterSpacing: "-0.02em" }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to access your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                      onClick={() => setShowPassword((prev) => !prev)}
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
              sx={{ display: "flex", justifyContent: "flex-end", mt: 1, mb: 3 }}
            >
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{ color: "primary.main", fontWeight: 500 }}
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
              sx={{ py: 1.75, fontWeight: 700, fontSize: "1rem" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                or continue with
              </Typography>
            </Divider>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 1.5,
              }}
            >
              {["Google", "Facebook", "Apple"].map((provider) => (
                <Button
                  key={provider}
                  fullWidth
                  variant="outlined"
                  sx={{ py: 1.25, fontSize: "0.8rem" }}
                  onClick={() => setError("Social login is not yet available.")}
                >
                  {provider}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right: Info Panel */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 4, md: 5 },
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            background: "linear-gradient(160deg, #1e3a8a 0%, #7c3aed 100%)",
            color: "white",
          }}
        >
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ mb: 2, lineHeight: 1.2, letterSpacing: "-0.02em" }}
          >
            Modern Banking,
            <br />
            Simplified.
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 5, opacity: 0.85, lineHeight: 1.7 }}
          >
            Access all your financial services in one place with our secure and
            intuitive platform.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {features.map((feature) => (
              <Box
                key={feature.title}
                sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 0.25 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    {feature.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              mt: 5,
              p: 2.5,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ opacity: 0.9, fontStyle: "italic", lineHeight: 1.6 }}
            >
              "FinovaBank has completely transformed how I manage my finances.
              The insights are incredible!"
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, mt: 1, display: "block" }}
            >
              — Sarah K., Premium Member
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
