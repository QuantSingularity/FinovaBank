import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { Box, Button, Typography, useTheme } from "@mui/material";
import type React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        p: 3,
        background: "linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%)",
      }}
    >
      <Box
        sx={{
          fontSize: "8rem",
          fontWeight: 900,
          lineHeight: 1,
          mb: 2,
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 400 }}
      >
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 2 }}
        >
          Go Back
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ borderRadius: 2 }}
        >
          Go Home
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;
