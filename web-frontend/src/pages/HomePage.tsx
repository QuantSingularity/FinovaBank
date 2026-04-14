import {
  AccountBalance as AccountBalanceIcon,
  ArrowForward as ArrowForwardIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  Language as LanguageIcon,
  Lock as LockIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Savings as SavingsIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  SupportAgent as SupportAgentIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useNavigate } from "react-router-dom";

/* ─── tiny keyframe injection ─── */
const injectStyles = () => {
  if (document.getElementById("hp-styles")) return;
  const style = document.createElement("style");
  style.id = "hp-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    @keyframes floatUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.6; }
      100% { transform: scale(1.7); opacity: 0; }
    }
    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .hp-hero-title { animation: floatUp 0.8s cubic-bezier(.22,1,.36,1) both; }
    .hp-hero-sub   { animation: floatUp 0.8s 0.15s cubic-bezier(.22,1,.36,1) both; }
    .hp-hero-cta   { animation: floatUp 0.8s 0.28s cubic-bezier(.22,1,.36,1) both; }
    .hp-hero-badge { animation: floatUp 0.8s 0.42s cubic-bezier(.22,1,.36,1) both; }
    .hp-card-reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .hp-card-reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .ticker-track {
      display: flex;
      gap: 48px;
      animation: ticker 28s linear infinite;
      width: max-content;
    }
    .ticker-track:hover { animation-play-state: paused; }
  `;
  document.head.appendChild(style);
};

/* ─── intersection observer helper ─── */
if (typeof window !== "undefined") {
  setTimeout(() => {
    const cards = document.querySelectorAll(".hp-card-reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("visible"),
        ),
      { threshold: 0.15 },
    );
    cards.forEach((c) => obs.observe(c));
  }, 300);
}

const HP_FONT = '"DM Serif Display", Georgia, serif';
const BODY_FONT = '"DM Sans", "Roboto", sans-serif';

const FEATURES = [
  {
    icon: <SpeedIcon />,
    color: "#2563eb",
    title: "Instant Transfers",
    desc: "Move money in seconds — domestic or international — with real-time confirmation and zero hidden fees.",
  },
  {
    icon: <BarChartIcon />,
    color: "#7c3aed",
    title: "Smart Analytics",
    desc: "Beautiful charts that break down every dollar. Know exactly where your money goes, every single month.",
  },
  {
    icon: <SavingsIcon />,
    color: "#059669",
    title: "Savings Goals",
    desc: "Set goals, automate contributions, and watch your wealth grow with personalised milestone tracking.",
  },
  {
    icon: <CreditCardIcon />,
    color: "#d97706",
    title: "Virtual Cards",
    desc: "Generate single-use virtual cards for online shopping. Freeze, unfreeze, or delete with one tap.",
  },
  {
    icon: <LockIcon />,
    color: "#dc2626",
    title: "Bank-Grade Security",
    desc: "256-bit encryption, biometric login, and real-time fraud detection protect every transaction.",
  },
  {
    icon: <SupportAgentIcon />,
    color: "#0284c7",
    title: "24 / 7 Support",
    desc: "Human support agents available round the clock — via chat, phone, or in-app video call.",
  },
];

const STATS = [
  { value: "2.4M+", label: "Active Customers" },
  { value: "$18B+", label: "Processed Annually" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "180+", label: "Countries Supported" },
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Freelance Designer",
    avatar: "S",
    color: "#7c3aed",
    rating: 5,
    text: "Switching to FinovaBank was the best financial decision I made this year. The analytics alone saved me hours every month.",
  },
  {
    name: "James T.",
    role: "Software Engineer",
    avatar: "J",
    color: "#2563eb",
    rating: 5,
    text: "International wire transfers used to take days. Now they're instant. I can't imagine going back to my old bank.",
  },
  {
    name: "Priya M.",
    role: "Small Business Owner",
    avatar: "P",
    color: "#059669",
    rating: 5,
    text: "The savings goals feature helped me hit my business expansion target six months ahead of schedule.",
  },
];

const PLANS = [
  {
    name: "Essential",
    price: "Free",
    color: "#64748b",
    highlight: false,
    perks: ["1 account", "Instant transfers", "Basic analytics", "Mobile app"],
  },
  {
    name: "Plus",
    price: "$9",
    color: "#2563eb",
    highlight: true,
    perks: [
      "3 accounts",
      "Virtual cards",
      "Advanced analytics",
      "Priority support",
      "Savings automation",
    ],
  },
  {
    name: "Pro",
    price: "$24",
    color: "#7c3aed",
    highlight: false,
    perks: [
      "Unlimited accounts",
      "Unlimited cards",
      "Custom reports",
      "Dedicated manager",
      "API access",
      "Team roles",
    ],
  },
];

const TICKER_ITEMS = [
  "✦ Zero hidden fees",
  "✦ FDIC Insured",
  "✦ 256-bit encryption",
  "✦ Instant transfers",
  "✦ No minimum balance",
  "✦ Free ATM access",
  "✦ Multi-currency support",
  "✦ Open in 3 minutes",
];

const HomePage: React.FC = () => {
  injectStyles();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{ fontFamily: BODY_FONT, bgcolor: "#f8fafc", overflowX: "hidden" }}
    >
      {/* ─── NAV ─── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(20px)",
          bgcolor: "rgba(248,250,252,0.88)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
            }}
          >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccountBalanceIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: HP_FONT,
                  fontSize: "1.3rem",
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                }}
              >
                FinovaBank
              </Typography>
            </Box>

            {/* Nav links (desktop) */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 3 }}>
                {["Features", "Pricing", "Security", "About"].map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      fontFamily: BODY_FONT,
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "#475569",
                      cursor: "pointer",
                      "&:hover": { color: "#2563eb" },
                      transition: "color .2s",
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            )}

            {/* CTA buttons */}
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate("/login")}
                sx={{
                  fontFamily: BODY_FONT,
                  fontWeight: 600,
                  borderColor: "#cbd5e1",
                  color: "#334155",
                  "&:hover": { borderColor: "#2563eb", color: "#2563eb" },
                  borderRadius: 2,
                  px: 2,
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate("/register")}
                sx={{
                  fontFamily: BODY_FONT,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  borderRadius: 2,
                  px: 2,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "0 4px 16px rgba(37,99,235,0.35)" },
                }}
              >
                Open Account
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── HERO ─── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 14 },
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.12) 0%, transparent 70%), #f8fafc",
        }}
      >
        {/* background circles */}
        {[
          { size: 480, x: "-8%", y: "10%", color: "rgba(37,99,235,0.06)" },
          { size: 360, x: "70%", y: "30%", color: "rgba(124,58,237,0.07)" },
          { size: 240, x: "55%", y: "-5%", color: "rgba(5,150,105,0.06)" },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: c.size,
              height: c.size,
              borderRadius: "50%",
              bgcolor: c.color,
              left: c.x,
              top: c.y,
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", maxWidth: 760, mx: "auto" }}>
            <Chip
              label="🏦  Now serving 180+ countries"
              size="small"
              className="hp-hero-badge"
              sx={{
                mb: 3,
                fontFamily: BODY_FONT,
                fontWeight: 600,
                fontSize: "0.78rem",
                bgcolor: "rgba(37,99,235,0.08)",
                color: "#2563eb",
                border: "1px solid rgba(37,99,235,0.2)",
                borderRadius: 6,
                px: 1,
              }}
            />

            <Typography
              className="hp-hero-title"
              sx={{
                fontFamily: HP_FONT,
                fontSize: { xs: "2.6rem", sm: "3.5rem", md: "4.4rem" },
                lineHeight: 1.1,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                mb: 2.5,
              }}
            >
              Banking that{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontStyle: "italic",
                }}
              >
                works for you
              </Box>
            </Typography>

            <Typography
              className="hp-hero-sub"
              sx={{
                fontFamily: BODY_FONT,
                fontSize: { xs: "1rem", md: "1.2rem" },
                color: "#64748b",
                maxWidth: 560,
                mx: "auto",
                mb: 4,
                lineHeight: 1.7,
              }}
            >
              Manage your money, track spending, grow savings, and transfer
              globally — all from one beautifully simple account.
            </Typography>

            <Box
              className="hp-hero-cta"
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/register")}
                sx={{
                  fontFamily: BODY_FONT,
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
                  "&:hover": { boxShadow: "0 12px 32px rgba(37,99,235,0.4)" },
                }}
              >
                Open Free Account
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/")}
                sx={{
                  fontFamily: BODY_FONT,
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderColor: "#cbd5e1",
                  color: "#334155",
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  "&:hover": { borderColor: "#2563eb", color: "#2563eb" },
                }}
              >
                View Dashboard
              </Button>
            </Box>

            {/* trust badges */}
            <Box
              className="hp-hero-badge"
              sx={{
                mt: 5,
                display: "flex",
                justifyContent: "center",
                gap: { xs: 2, md: 4 },
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  icon: <SecurityIcon sx={{ fontSize: 16 }} />,
                  label: "FDIC Insured",
                },
                {
                  icon: <LockIcon sx={{ fontSize: 16 }} />,
                  label: "256-bit Encryption",
                },
                {
                  icon: <LanguageIcon sx={{ fontSize: 16 }} />,
                  label: "180+ Countries",
                },
                {
                  icon: <PhoneAndroidIcon sx={{ fontSize: 16 }} />,
                  label: "iOS & Android",
                },
              ].map((b) => (
                <Box
                  key={b.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    color: "#64748b",
                    fontSize: "0.82rem",
                    fontFamily: BODY_FONT,
                    fontWeight: 500,
                  }}
                >
                  {b.icon} {b.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── TICKER ─── */}
      <Box
        sx={{
          bgcolor: "#0f172a",
          py: 1.5,
          overflow: "hidden",
          borderTop: "1px solid #1e293b",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <Box className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <Typography
              key={i}
              sx={{
                fontFamily: BODY_FONT,
                fontWeight: 600,
                fontSize: "0.82rem",
                color: "#94a3b8",
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* ─── STATS ─── */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 0,
            }}
          >
            {STATS.map((s, i) => (
              <Box
                key={s.label}
                className="hp-card-reveal"
                sx={{
                  py: 5,
                  px: 4,
                  textAlign: "center",
                  borderRight: i < 3 ? "1px solid #e2e8f0" : "none",
                  borderBottom: {
                    xs: i < 2 ? "1px solid #e2e8f0" : "none",
                    md: "none",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: HP_FONT,
                    fontSize: { xs: "2rem", md: "2.8rem" },
                    color: "#0f172a",
                    lineHeight: 1,
                    mb: 0.5,
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.value}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: BODY_FONT,
                    fontSize: "0.88rem",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── FEATURES ─── */}
      <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: "#f8fafc" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Chip
              label="Everything you need"
              size="small"
              sx={{
                mb: 2,
                fontFamily: BODY_FONT,
                fontWeight: 600,
                bgcolor: "rgba(124,58,237,0.08)",
                color: "#7c3aed",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 6,
              }}
            />
            <Typography
              sx={{
                fontFamily: HP_FONT,
                fontSize: { xs: "2rem", md: "2.8rem" },
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                mb: 1.5,
              }}
            >
              Features built for modern life
            </Typography>
            <Typography
              sx={{
                fontFamily: BODY_FONT,
                color: "#64748b",
                maxWidth: 480,
                mx: "auto",
                fontSize: "1rem",
                lineHeight: 1.7,
              }}
            >
              From daily spending to long-term savings, FinovaBank has every
              financial tool you'll ever need.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {FEATURES.map((f, i) => (
              <Paper
                key={f.title}
                elevation={0}
                className="hp-card-reveal"
                style={{ transitionDelay: `${i * 80}ms` }}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  bgcolor: "white",
                  cursor: "default",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
                    borderColor: f.color + "44",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: f.color + "14",
                    color: f.color,
                    mb: 2.5,
                    fontSize: 24,
                  }}
                >
                  {f.icon}
                </Box>
                <Typography
                  sx={{
                    fontFamily: BODY_FONT,
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#0f172a",
                    mb: 1,
                  }}
                >
                  {f.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: BODY_FONT,
                    color: "#64748b",
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
                  }}
                >
                  {f.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── CTA BANNER ─── */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #4c1d95 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative rings */}
        {[200, 320, 440].map((size, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.06)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              pointerEvents: "none",
            }}
          />
        ))}
        <Container
          maxWidth="md"
          sx={{ position: "relative", zIndex: 1, textAlign: "center" }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 4,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <TrendingUpIcon sx={{ color: "white", fontSize: 32 }} />
          </Box>
          <Typography
            sx={{
              fontFamily: HP_FONT,
              fontSize: { xs: "2rem", md: "3rem" },
              color: "white",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Ready to take control of your finances?
          </Typography>
          <Typography
            sx={{
              fontFamily: BODY_FONT,
              color: "rgba(255,255,255,0.65)",
              fontSize: "1rem",
              mb: 4,
              maxWidth: 480,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Join 2.4 million people who've already made the switch. Open your
            free account in under 3 minutes.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<SendIcon />}
              onClick={() => navigate("/register")}
              sx={{
                fontFamily: BODY_FONT,
                fontWeight: 700,
                bgcolor: "white",
                color: "#1e3a8a",
                borderRadius: 3,
                px: 4,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#f1f5f9",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                },
              }}
            >
              Get Started — It's Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/")}
              sx={{
                fontFamily: BODY_FONT,
                fontWeight: 600,
                borderColor: "rgba(255,255,255,0.35)",
                color: "white",
                borderRadius: 3,
                px: 4,
                py: 1.5,
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Explore Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── TESTIMONIALS ─── */}
      <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 7 }}>
            <Chip
              label="Customer stories"
              size="small"
              sx={{
                mb: 2,
                fontFamily: BODY_FONT,
                fontWeight: 600,
                bgcolor: "rgba(5,150,105,0.08)",
                color: "#059669",
                border: "1px solid rgba(5,150,105,0.2)",
                borderRadius: 6,
              }}
            />
            <Typography
              sx={{
                fontFamily: HP_FONT,
                fontSize: { xs: "2rem", md: "2.8rem" },
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Loved by customers
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
              gap: 3,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <Paper
                key={t.name}
                elevation={0}
                className="hp-card-reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '"\u201c"',
                    position: "absolute",
                    top: 12,
                    right: 20,
                    fontFamily: HP_FONT,
                    fontSize: "5rem",
                    color: t.color + "18",
                    lineHeight: 1,
                    pointerEvents: "none",
                  },
                }}
              >
                <Box sx={{ display: "flex", gap: 0.3, mb: 2.5 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} sx={{ fontSize: 16, color: "#f59e0b" }} />
                  ))}
                </Box>
                <Typography
                  sx={{
                    fontFamily: BODY_FONT,
                    color: "#334155",
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    mb: 3,
                  }}
                >
                  "{t.text}"
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: t.color + "20",
                      color: t.color,
                      fontFamily: BODY_FONT,
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    {t.avatar}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: BODY_FONT,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "#0f172a",
                      }}
                    >
                      {t.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: BODY_FONT,
                        fontSize: "0.78rem",
                        color: "#94a3b8",
                      }}
                    >
                      {t.role}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── PRICING ─── */}
      <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: "#f8fafc" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 7 }}>
            <Chip
              label="Simple pricing"
              size="small"
              sx={{
                mb: 2,
                fontFamily: BODY_FONT,
                fontWeight: 600,
                bgcolor: "rgba(37,99,235,0.08)",
                color: "#2563eb",
                border: "1px solid rgba(37,99,235,0.2)",
                borderRadius: 6,
              }}
            />
            <Typography
              sx={{
                fontFamily: HP_FONT,
                fontSize: { xs: "2rem", md: "2.8rem" },
                color: "#0f172a",
                letterSpacing: "-0.02em",
                mb: 1.5,
              }}
            >
              Plans for everyone
            </Typography>
            <Typography
              sx={{ fontFamily: BODY_FONT, color: "#64748b", fontSize: "1rem" }}
            >
              Start for free. Upgrade when you need more.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            {PLANS.map((plan, i) => (
              <Paper
                key={plan.name}
                elevation={0}
                className="hp-card-reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: plan.highlight
                    ? `2px solid ${plan.color}`
                    : "1px solid #e2e8f0",
                  bgcolor: plan.highlight ? plan.color : "white",
                  color: plan.highlight ? "white" : "inherit",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {plan.highlight && (
                  <Chip
                    label="Most Popular"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      fontFamily: BODY_FONT,
                      fontWeight: 700,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontSize: "0.72rem",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  />
                )}
                <Typography
                  sx={{
                    fontFamily: BODY_FONT,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: plan.highlight ? "rgba(255,255,255,0.7)" : "#94a3b8",
                    mb: 1.5,
                  }}
                >
                  {plan.name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 0.5,
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: HP_FONT,
                      fontSize: "2.8rem",
                      lineHeight: 1,
                      color: plan.highlight ? "white" : "#0f172a",
                    }}
                  >
                    {plan.price}
                  </Typography>
                  {plan.price !== "Free" && (
                    <Typography
                      sx={{
                        fontFamily: BODY_FONT,
                        color: plan.highlight
                          ? "rgba(255,255,255,0.6)"
                          : "#94a3b8",
                        fontSize: "0.9rem",
                      }}
                    >
                      / mo
                    </Typography>
                  )}
                </Box>
                <Divider
                  sx={{
                    borderColor: plan.highlight
                      ? "rgba(255,255,255,0.2)"
                      : "#e2e8f0",
                    mb: 3,
                  }}
                />
                <Box
                  sx={{
                    mb: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  {plan.perks.map((perk) => (
                    <Box
                      key={perk}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <CheckCircleIcon
                        sx={{
                          fontSize: 18,
                          color: plan.highlight
                            ? "rgba(255,255,255,0.8)"
                            : plan.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: BODY_FONT,
                          fontSize: "0.9rem",
                          color: plan.highlight
                            ? "rgba(255,255,255,0.85)"
                            : "#475569",
                        }}
                      >
                        {perk}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  fullWidth
                  variant={plan.highlight ? "contained" : "outlined"}
                  onClick={() => navigate("/register")}
                  sx={{
                    fontFamily: BODY_FONT,
                    fontWeight: 700,
                    borderRadius: 2.5,
                    py: 1.25,
                    ...(plan.highlight
                      ? {
                          bgcolor: "white",
                          color: plan.color,
                          "&:hover": { bgcolor: "#f1f5f9" },
                        }
                      : {
                          borderColor: "#cbd5e1",
                          color: "#334155",
                          "&:hover": {
                            borderColor: plan.color,
                            color: plan.color,
                          },
                        }),
                  }}
                >
                  {plan.price === "Free" ? "Start for Free" : "Get Started"}
                </Button>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── FOOTER ─── */}
      <Box sx={{ bgcolor: "#0f172a", pt: 8, pb: 5 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "2fr 1fr 1fr 1fr" },
              gap: 5,
              mb: 6,
            }}
          >
            {/* Brand */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccountBalanceIcon sx={{ color: "white", fontSize: 18 }} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: HP_FONT,
                    color: "white",
                    fontSize: "1.2rem",
                  }}
                >
                  FinovaBank
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: BODY_FONT,
                  color: "#475569",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                  maxWidth: 260,
                }}
              >
                Modern banking for modern lives. Secure, simple, and built for
                the world.
              </Typography>
            </Box>

            {/* Links */}
            {[
              {
                heading: "Product",
                links: ["Features", "Pricing", "Security", "Roadmap"],
              },
              {
                heading: "Company",
                links: ["About", "Careers", "Press", "Blog"],
              },
              {
                heading: "Support",
                links: ["Help Center", "Contact", "Status", "Privacy"],
              },
            ].map((col) => (
              <Box key={col.heading}>
                <Typography
                  sx={{
                    fontFamily: BODY_FONT,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#94a3b8",
                    mb: 2,
                  }}
                >
                  {col.heading}
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                >
                  {col.links.map((link) => (
                    <Typography
                      key={link}
                      sx={{
                        fontFamily: BODY_FONT,
                        fontSize: "0.875rem",
                        color: "#64748b",
                        cursor: "pointer",
                        "&:hover": { color: "#94a3b8" },
                        transition: "color .2s",
                      }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: "#1e293b", mb: 4 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: BODY_FONT,
                color: "#475569",
                fontSize: "0.8rem",
              }}
            >
              © {new Date().getFullYear()} FinovaBank. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              {["Terms", "Privacy", "Cookies"].map((item) => (
                <Typography
                  key={item}
                  sx={{
                    fontFamily: BODY_FONT,
                    fontSize: "0.8rem",
                    color: "#475569",
                    cursor: "pointer",
                    "&:hover": { color: "#94a3b8" },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
