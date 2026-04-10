import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7c3aed",
      light: "#a78bfa",
      dark: "#5b21b6",
      contrastText: "#ffffff",
    },
    success: {
      main: "#059669",
      light: "#34d399",
      dark: "#065f46",
    },
    error: {
      main: "#dc2626",
      light: "#f87171",
      dark: "#991b1b",
    },
    warning: {
      main: "#d97706",
      light: "#fbbf24",
      dark: "#92400e",
    },
    info: {
      main: "#0284c7",
      light: "#38bdf8",
      dark: "#075985",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
      disabled: "#94a3b8",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: "2.5rem", letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em" },
    h3: { fontWeight: 700, fontSize: "1.75rem" },
    h4: { fontWeight: 700, fontSize: "1.5rem" },
    h5: { fontWeight: 600, fontSize: "1.25rem" },
    h6: { fontWeight: 600, fontSize: "1rem" },
    subtitle1: { fontWeight: 500, fontSize: "1rem" },
    subtitle2: { fontWeight: 500, fontSize: "0.875rem" },
    body1: { fontWeight: 400, fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.5 },
    button: { fontWeight: 600, fontSize: "0.875rem", textTransform: "none" },
    caption: { fontWeight: 400, fontSize: "0.75rem" },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)",
    "0px 4px 6px rgba(15, 23, 42, 0.05), 0px 2px 4px rgba(15, 23, 42, 0.06)",
    "0px 10px 15px rgba(15, 23, 42, 0.07), 0px 4px 6px rgba(15, 23, 42, 0.05)",
    "0px 20px 25px rgba(15, 23, 42, 0.08), 0px 10px 10px rgba(15, 23, 42, 0.04)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
    "0px 25px 50px rgba(15, 23, 42, 0.1)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          padding: "8px 20px",
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(37, 99, 235, 0.3)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            "0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)",
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: { root: { padding: "20px 24px 16px" } },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px 24px 24px",
          "&:last-child": { paddingBottom: "24px" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#f8fafc",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2563eb",
            },
            "&.Mui-focused": { backgroundColor: "#ffffff" },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 0px #e2e8f0",
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #e2e8f0",
          boxShadow: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "14px 20px", borderColor: "#e2e8f0" },
        head: {
          fontWeight: 600,
          backgroundColor: "#f8fafc",
          color: "#475569",
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, backgroundColor: "#e2e8f0" },
        bar: { borderRadius: 8 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: "#0f172a",
          fontSize: "0.75rem",
        },
      },
    },
  },
});

export default theme;
