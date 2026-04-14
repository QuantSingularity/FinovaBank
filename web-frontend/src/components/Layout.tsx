import {
  AccountBalance as AccountBalanceIcon,
  ChevronLeft as ChevronLeftIcon,
  CreditCard as CreditCardIcon,
  Dashboard as DashboardIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Savings as SavingsIcon,
  Settings as SettingsIcon,
  ShowChart as ShowChartIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 260;

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setNotificationAnchorEl(event.currentTarget);
  const handleNotificationMenuClose = () => setNotificationAnchorEl(null);

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Transactions", icon: <PaymentIcon />, path: "/transactions" },
    { text: "Savings Goals", icon: <SavingsIcon />, path: "/savings" },
    { text: "Loans", icon: <CreditCardIcon />, path: "/loans" },
    { text: "Reports", icon: <ShowChartIcon />, path: "/reports" },
  ];

  const secondaryMenuItems = [
    { text: "Help & Support", icon: <HelpIcon />, path: "/support" },
  ];

  const notifications = [
    { title: "Your account statement is ready", time: "2 hours ago" },
    { title: "New transaction of $250.00 detected", time: "Yesterday" },
    {
      title: 'Your savings goal "Vacation" is 75% complete',
      time: "3 days ago",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "background.paper",
          color: "text.primary",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open &&
            !isMobile && {
              marginLeft: drawerWidth,
              width: `calc(100% - ${drawerWidth}px)`,
              transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }),
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={open ? handleDrawerClose : handleDrawerOpen}
              edge="start"
              sx={{ mr: 2 }}
            >
              {open && !isMobile ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            {(!open || isMobile) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccountBalanceIcon sx={{ color: "white", fontSize: 18 }} />
                </Box>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{
                    fontWeight: 800,
                    display: { xs: "none", sm: "block" },
                    letterSpacing: "-0.02em",
                  }}
                >
                  FinovaBank
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: 3,
                px: 1.5,
                py: 0.75,
                "&:hover": { bgcolor: "rgba(37, 99, 235, 0.05)" },
                transition: "background 0.2s",
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <Box sx={{ ml: 1.5, display: { xs: "none", sm: "block" } }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, lineHeight: 1.3 }}
                >
                  {user?.name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1 }}
                >
                  {user?.role === "ADMIN"
                    ? "Administrator"
                    : "Personal Account"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerClose : undefined}
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            minHeight: "64px !important",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountBalanceIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              FinovaBank
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose} size="small">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Toolbar>
        <Divider />

        <Box
          sx={{
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            py: 2,
          }}
        >
          <Box sx={{ px: 2, mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                px: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Main Menu
            </Typography>
          </Box>
          <List sx={{ px: 2 }} disablePadding>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={isMobile ? handleDrawerClose : undefined}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1.5,
                    "&.Mui-selected": {
                      bgcolor: `${theme.palette.primary.main}12`,
                      "&:hover": { bgcolor: `${theme.palette.primary.main}18` },
                    },
                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive
                        ? theme.palette.primary.main
                        : "text.secondary",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "primary.main" : "text.primary",
                      fontSize: "0.9rem",
                    }}
                  />
                  {isActive && (
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        ml: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </List>

          <Divider sx={{ my: 2, mx: 2 }} />

          <Box sx={{ px: 2, mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                px: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Account
            </Typography>
          </Box>
          <List sx={{ px: 2 }} disablePadding>
            <ListItemButton
              component={Link}
              to="/profile"
              onClick={isMobile ? handleDrawerClose : undefined}
              selected={location.pathname === "/profile"}
              sx={{ borderRadius: 2, mb: 0.5, px: 1.5 }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color:
                    location.pathname === "/profile"
                      ? "primary.main"
                      : "text.secondary",
                }}
              >
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary="My Profile"
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  fontWeight: location.pathname === "/profile" ? 600 : 400,
                }}
              />
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/settings"
              onClick={isMobile ? handleDrawerClose : undefined}
              selected={location.pathname === "/settings"}
              sx={{ borderRadius: 2, mb: 0.5, px: 1.5 }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color:
                    location.pathname === "/settings"
                      ? "primary.main"
                      : "text.secondary",
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  fontWeight: location.pathname === "/settings" ? 600 : 400,
                }}
              />
            </ListItemButton>
            {secondaryMenuItems.map((item) => (
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                onClick={isMobile ? handleDrawerClose : undefined}
                selected={location.pathname === item.path}
                sx={{ borderRadius: 2, mb: 0.5, px: 1.5 }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: "0.9rem" }}
                />
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ mt: "auto", px: 3, pb: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "rgba(37, 99, 235, 0.06)",
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                color="primary.main"
              >
                {user?.name || "User"}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                {user?.email || ""}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: "error.main",
                borderColor: "error.light",
                "&:hover": {
                  bgcolor: "error.lighter",
                  borderColor: "error.main",
                },
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: "64px",
          minWidth: 0,
          ...(open && !isMobile && { width: `calc(100% - ${drawerWidth}px)` }),
        }}
      >
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 3,
            boxShadow: "0px 8px 30px rgba(15, 23, 42, 0.12)",
            minWidth: 220,
            border: "1px solid #e2e8f0",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={600}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            navigate("/profile");
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            navigate("/settings");
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 3,
            boxShadow: "0px 8px 30px rgba(15, 23, 42, 0.12)",
            minWidth: 340,
            maxWidth: 340,
            border: "1px solid #e2e8f0",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          <Button size="small" sx={{ fontSize: "0.75rem" }}>
            Mark all read
          </Button>
        </Box>
        <Divider />
        {notifications.map((n, idx) => (
          <MenuItem
            key={idx}
            sx={{ py: 1.5, px: 2.5, whiteSpace: "normal" }}
            onClick={handleNotificationMenuClose}
          >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  mt: 0.75,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ lineHeight: 1.4 }}
                >
                  {n.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {n.time}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Button fullWidth size="small" onClick={handleNotificationMenuClose}>
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Layout;
