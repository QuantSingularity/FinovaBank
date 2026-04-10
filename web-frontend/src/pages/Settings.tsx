import {
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControlLabel,
  MenuItem,
  Snackbar,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useState } from "react";

const Settings: React.FC = () => {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    transactions: true,
    promotions: false,
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
  });
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");

  const handleSave = () =>
    setSnackbar({ open: true, message: "Settings saved successfully!" });

  const settingSections = [
    {
      title: "Notifications",
      icon: <NotificationsIcon />,
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            {
              key: "email",
              label: "Email Notifications",
              desc: "Receive updates via email",
            },
            {
              key: "push",
              label: "Push Notifications",
              desc: "Browser and mobile alerts",
            },
            {
              key: "sms",
              label: "SMS Notifications",
              desc: "Text message alerts",
            },
            {
              key: "transactions",
              label: "Transaction Alerts",
              desc: "Notify on every transaction",
            },
            {
              key: "promotions",
              label: "Promotional Emails",
              desc: "News and offers from FinovaBank",
            },
          ].map(({ key, label, desc }) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {desc}
                </Typography>
              </Box>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    [key]: e.target.checked,
                  })
                }
                color="primary"
                size="small"
              />
            </Box>
          ))}
        </Box>
      ),
    },
    {
      title: "Security",
      icon: <SecurityIcon />,
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Two-Factor Authentication
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add extra security to your account
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {security.twoFactor && (
                <Chip label="Active" size="small" color="success" />
              )}
              <Switch
                checked={security.twoFactor}
                onChange={(e) =>
                  setSecurity({ ...security, twoFactor: e.target.checked })
                }
                color="primary"
                size="small"
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Login Alerts
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Notify when a new device logs in
              </Typography>
            </Box>
            <Switch
              checked={security.loginAlerts}
              onChange={(e) =>
                setSecurity({ ...security, loginAlerts: e.target.checked })
              }
              color="primary"
              size="small"
            />
          </Box>
          <Divider sx={{ my: 1 }} />
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            size="small"
            sx={{ alignSelf: "flex-start" }}
          >
            Change Password
          </Button>
        </Box>
      ),
    },
    {
      title: "Preferences",
      icon: <LanguageIcon />,
      content: (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Currency"
            select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            size="small"
          >
            {[
              { value: "USD", label: "USD — US Dollar" },
              { value: "EUR", label: "EUR — Euro" },
              { value: "GBP", label: "GBP — British Pound" },
              { value: "PKR", label: "PKR — Pakistani Rupee" },
            ].map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Language"
            select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            size="small"
          >
            {[
              { value: "en", label: "English" },
              { value: "es", label: "Español" },
              { value: "fr", label: "Français" },
              { value: "de", label: "Deutsch" },
            ].map((l) => (
              <MenuItem key={l.value} value={l.value}>
                {l.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      ),
    },
  ];

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {settingSections.map((section) => (
          <Card
            key={section.title}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardHeader
              title={section.title}
              titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
              avatar={
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: `${theme.palette.primary.main}12`,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {section.icon}
                </Box>
              }
            />
            <Divider />
            <CardContent>{section.content}</CardContent>
          </Card>
        ))}
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

export default Settings;
