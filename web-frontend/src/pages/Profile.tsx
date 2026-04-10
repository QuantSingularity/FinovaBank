import {
  CameraAlt as CameraIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleSave = () => {
    setEditing(false);
    setSnackbar({ open: true, message: "Profile updated successfully!" });
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.08) 100%)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 3,
        }}
      >
        {/* Avatar Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            height: "fit-content",
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "2px solid white",
                }}
              >
                <CameraIcon sx={{ fontSize: 16, color: "white" }} />
              </Box>
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {user?.email}
            </Typography>
            <Chip
              label={
                user?.role === "ADMIN" ? "Administrator" : "Personal Account"
              }
              size="small"
              color={user?.role === "ADMIN" ? "secondary" : "primary"}
              variant="outlined"
            />
            {user?.createdAt && (
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 1.5 }}
              >
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
        >
          <CardHeader
            title="Personal Information"
            titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
            action={
              <Button
                startIcon={editing ? <SaveIcon /> : <EditIcon />}
                variant={editing ? "contained" : "outlined"}
                size="small"
                onClick={editing ? handleSave : () => setEditing(true)}
              >
                {editing ? "Save Changes" : "Edit"}
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Full Name
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="small"
                    sx={{ mt: 0.5 }}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon
                          sx={{ mr: 1, color: "text.secondary", fontSize: 18 }}
                        />
                      ),
                    }}
                  />
                ) : (
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {user?.name || "—"}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Email Address
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="body1" fontWeight={600}>
                    {user?.email || "—"}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  User ID
                </Typography>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{ mt: 0.5, color: "text.secondary" }}
                >
                  {user?.id || "—"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Account Role
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {user?.role || "USER"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
