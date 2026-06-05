import { createTheme, Theme } from "@mui/material/styles";

export function buildTheme(mode: "light" | "dark"): Theme {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#00C853",
        light: "#69F0AE",
        dark: "#00701A",
        contrastText: "#000",
      },
      secondary: {
        main: "#FFD600",
        light: "#FFFF52",
        dark: "#C7A500",
        contrastText: "#000",
      },
      background: {
        default: isDark ? "#0A0E1A" : "#F0F4F8",
        paper: isDark ? "#131929" : "#FFFFFF",
      },
      error: { main: "#FF5252" },
      text: {
        primary: isDark ? "#F0F4FF" : "#0D1B2A",
        secondary: isDark ? "#8DA0CC" : "#4A5568",
      },
      divider: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    },
    typography: {
      fontFamily:
        '"Barlow Condensed", "Roboto Condensed", "Arial Narrow", sans-serif',
      h1: { fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: {
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: ${isDark ? "#0A0E1A" : "#F0F4F8"}; }
          ::-webkit-scrollbar-thumb { background: ${isDark ? "#1E2940" : "#CBD5E0"}; border-radius: 3px; }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 700 },
          containedPrimary: {
            background: "linear-gradient(135deg, #00C853 0%, #00701A 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #69F0AE 0%, #00C853 100%)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark ? "#131929" : "#FFFFFF",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark
              ? "rgba(10,14,26,0.85)"
              : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
            color: isDark ? "#F0F4FF" : "#0D1B2A",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark ? "#0F1624" : "#FFFFFF",
            borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600, letterSpacing: "0.04em" } },
      },
      MuiTab: {
        styleOverrides: {
          root: { fontWeight: 700, letterSpacing: "0.05em", minHeight: 44 },
        },
      },
    },
  });
}

// Default export kept for backwards compat during migration
export const theme = buildTheme("dark");
