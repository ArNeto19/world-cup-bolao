import React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background:
          "radial-gradient(ellipse at 60% 20%, rgba(0,200,83,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(255,214,0,0.06) 0%, transparent 50%), #0A0E1A",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          maxWidth: 420,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(19,25,41,0.9)",
          backdropFilter: "blur(20px)",
          textAlign: "center",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "rgba(0,200,83,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(0,200,83,0.3)",
            }}
          >
            <SportsSoccerIcon sx={{ fontSize: 34, color: "primary.main" }} />
          </Box>
        </Box>

        <Typography
          variant="h4"
          fontWeight={800}
          gutterBottom
          sx={{ color: "primary.main", letterSpacing: 1 }}
        >
          BOLÃO
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{ color: "text.primary", letterSpacing: 2 }}
        >
          COPA DO MUNDO 2026
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
          Entre com sua conta Google para fazer seus palpites e disputar com os
          amigos!
        </Typography>

        {loading ? (
          <CircularProgress color="primary" />
        ) : (
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={signInWithGoogle}
            fullWidth
            sx={{ py: 1.5, fontSize: 15 }}
          >
            Entrar com Google
          </Button>
        )}

        <Typography
          variant="caption"
          sx={{ display: "block", mt: 3, color: "text.secondary" }}
        >
          Ao entrar, você concorda em participar do bolão e se comprometer com a
          fair-play. ⚽
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
