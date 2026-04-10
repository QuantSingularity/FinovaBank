// Modern Register page with enhanced UI

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Devices as DevicesIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import GridCompatibility from "../components/GridCompatibility";
import { useAuth } from "../context/AuthContext";

const Register: React.FC = () => {
  const theme = useTheme();
  const { register } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const steps = ["Personal Information", "Account Security", "Review & Submit"];

  const handleNext = () => {
    if (activeStep === 0) {
      if (!name || !email || !phone) {
        setError("Please fill in all required fields");
        return;
      }

      // Basic email validation
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      setError(null);
      setActiveStep((prevStep) => prevStep + 1);
    } else if (activeStep === 1) {
      if (!password || !confirmPassword) {
        setError("Please fill in all required fields");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      setError(null);
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      setError("You must agree to the Terms and Conditions");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      await register(name, email, password);
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
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
        {/* Left Side - Register Form */}
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
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Join thousands of users managing their finances with FinovaBank
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={activeStep === 2 ? handleSubmit : undefined}
          >
            {/* Step 1: Personal Information */}
            {activeStep === 0 && (
              <>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  label="Phone Number"
                  variant="outlined"
                  margin="normal"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            {/* Step 2: Account Security */}
            {activeStep === 1 && (
              <>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  helperText="Password must be at least 8 characters long"
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  variant="outlined"
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            {/* Step 3: Review & Submit */}
            {activeStep === 2 && (
              <>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 3,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Personal Information
                  </Typography>

                  <GridCompatibility container spacing={2} sx={{ mb: 2 }}>
                    <GridCompatibility xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                    </GridCompatibility>
                    <GridCompatibility xs={8}>
                      <Typography variant="body2" fontWeight={500}>
                        {name}
                      </Typography>
                    </GridCompatibility>

                    <GridCompatibility xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Email Address
                      </Typography>
                    </GridCompatibility>
                    <GridCompatibility xs={8}>
                      <Typography variant="body2" fontWeight={500}>
                        {email}
                      </Typography>
                    </GridCompatibility>

                    <GridCompatibility xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Phone Number
                      </Typography>
                    </GridCompatibility>
                    <GridCompatibility xs={8}>
                      <Typography variant="body2" fontWeight={500}>
                        {phone}
                      </Typography>
                    </GridCompatibility>
                  </GridCompatibility>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Account Security
                  </Typography>

                  <GridCompatibility container spacing={2}>
                    <GridCompatibility xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Password
                      </Typography>
                    </GridCompatibility>
                    <GridCompatibility xs={8}>
                      <Typography variant="body2" fontWeight={500}>
                        ••••••••
                      </Typography>
                    </GridCompatibility>
                  </GridCompatibility>
                </Paper>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{" "}
                      <Link
                        component={RouterLink}
                        to="/terms"
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        component={RouterLink}
                        to="/privacy"
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 3 }}
                />
              </>
            )}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              {activeStep > 0 ? (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<ChevronLeftIcon />}
                  sx={{ px: 3 }}
                >
                  Back
                </Button>
              ) : (
                <Box /> // Empty box for spacing
              )}

              {activeStep < 2 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ChevronRightIcon />}
                  sx={{ px: 3 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !agreeTerms}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: "0px 8px 16px rgba(51, 102, 255, 0.24)",
                  }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              )}
            </Box>

            {activeStep === 0 && (
              <>
                <Box sx={{ mt: 4, mb: 2 }}>
                  <Divider>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ px: 1 }}
                    >
                      Or sign up with
                    </Typography>
                  </Divider>
                </Box>

                <GridCompatibility container spacing={2}>
                  <GridCompatibility xs={4}>
                    <Button fullWidth variant="outlined" sx={{ py: 1.5 }}>
                      Google
                    </Button>
                  </GridCompatibility>
                  <GridCompatibility xs={4}>
                    <Button fullWidth variant="outlined" sx={{ py: 1.5 }}>
                      Facebook
                    </Button>
                  </GridCompatibility>
                  <GridCompatibility xs={4}>
                    <Button fullWidth variant="outlined" sx={{ py: 1.5 }}>
                      Apple
                    </Button>
                  </GridCompatibility>
                </GridCompatibility>

                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Link
                      component={RouterLink}
                      to="/login"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Right Side - Image and Info */}
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
            Join FinovaBank Today
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Experience the future of banking with our innovative digital
            platform designed for your financial success.
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
                    <SecurityIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Bank-Grade Security
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Your data and money are protected with advanced encryption
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
                    <DevicesIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Seamless Experience
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Access your accounts from any device with our responsive
                      platform
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
                    <SupportIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      24/7 Support
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Our dedicated team is always ready to assist you
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

export default Register;
