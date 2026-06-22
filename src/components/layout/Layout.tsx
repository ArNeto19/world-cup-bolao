import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  Switch,
  Tooltip,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import Close from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useAuth } from "../../store/AuthContext";
import { useThemeMode } from "../../store/ThemeContext";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Início", path: "/", icon: <HomeIcon /> },
  { label: "Grupos", path: "/groups", icon: <GroupsIcon /> },
  { label: "Partidas", path: "/matches", icon: <SportsSoccerIcon /> },
];

const Layout = () => {
  const { user, signOut } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isPlayer = user?.role === "player";
  const isAdmin = user?.role === "admin";

  const visibleNavItems = isPlayer || isAdmin ? navItems : navItems.slice(0, 1);
  let bottomNavItems = visibleNavItems;

  if (isPlayer) {
    bottomNavItems = navItems;
  } else if (isAdmin) {
    bottomNavItems = [
      ...navItems.slice(0, 2),
      { label: "Admin", path: "/admin", icon: <AdminPanelSettingsIcon /> },
    ];
  }

  const handleNav = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  // Bottom nav value: match by prefix
  const bottomNavValue = bottomNavItems.findIndex((n) =>
    n.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(n.path),
  );

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, height: "100%", pt: 2 }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, pb: 2 }}
      >
        <SportsSoccerIcon sx={{ color: "primary.main", fontSize: 28 }} />
        <Box>
          <Typography
            variant="h6"
            sx={{ lineHeight: 1, color: "primary.main", fontWeight: 800 }}
          >
            BOLÃO
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", letterSpacing: 2 }}
          >
            COPA 2026
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1, pt: 1 }}>
        {visibleNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path)
              }
              onClick={() => handleNav(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(0,200,83,0.12)",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                  "& .MuiListItemText-primary": {
                    color: "primary.main",
                    fontWeight: 700,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        {user?.role === "admin" && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.startsWith("/admin")}
                onClick={() => handleNav("/admin")}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "rgba(255,214,0,0.1)",
                    "& .MuiListItemIcon-root": { color: "secondary.main" },
                    "& .MuiListItemText-primary": {
                      color: "secondary.main",
                      fontWeight: 700,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Administração" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      {/* Theme toggle in sidebar */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <DarkModeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Switch
          checked={mode === "light"}
          onChange={toggleMode}
          size="small"
          color="primary"
        />
        <LightModeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          {mode === "dark" ? "Escuro" : "Claro"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ── AppBar ─────────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ color: "text.primary" }}
            >
              {drawerOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          )}

          <SportsSoccerIcon sx={{ color: "primary.main" }} />
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              color: "primary.main",
              fontSize: { xs: 15, sm: 18 },
            }}
          >
            BOLÃO COPA 2026
          </Typography>

          {/* Theme toggle — AppBar (always visible) */}
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"}>
            <IconButton
              onClick={toggleMode}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              {mode === "dark" ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {user && (
            <>
              {user.role === "admin" && (
                <Chip
                  label="ADMIN"
                  size="small"
                  color="secondary"
                  sx={{
                    fontWeight: 700,
                    fontSize: 10,
                    height: 20,
                    display: { xs: "none", sm: "flex" },
                  }}
                />
              )}
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  src={user.photoURL}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.dark",
                    fontSize: 14,
                  }}
                >
                  {user.displayName?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem dense disabled sx={{ opacity: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {user.displayName}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleNav("/profile");
                    setAnchorEl(null);
                  }}
                >
                  Meu Perfil
                </MenuItem>
                {user.role === "admin" && (
                  <MenuItem
                    onClick={() => {
                      handleNav("/admin");
                      setAnchorEl(null);
                    }}
                  >
                    Administração
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    signOut();
                    setAnchorEl(null);
                  }}
                  sx={{ color: "error.main" }}
                >
                  Sair
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Sidebar (desktop only) ─────────────────────────────────────── */}
      {isMobile ? (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              border: "none",
            },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      )}

      {/* ── Main content ───────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: "56px", sm: "64px" },
          mb: isMobile ? "56px" : 0, // space for bottom nav
          minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          bgcolor: "background.default",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>

      {/* ── Bottom navigation (mobile only) ───────────────────────────── */}
      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
          elevation={0}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(_, v) => handleNav(bottomNavItems[v]?.path ?? "/")}
            sx={{ bgcolor: "background.paper", height: 56 }}
          >
            {bottomNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                sx={{
                  fontSize: 10,
                  "&.Mui-selected": { color: "primary.main" },
                  minWidth: 0,
                  px: 0.5,
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default Layout;
