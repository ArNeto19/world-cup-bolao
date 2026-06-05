import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import { useAuth } from "../../store/AuthContext";
import { updateDisplayName } from "../../services/firestoreService";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.displayName ?? "");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    await updateDisplayName(user.uid, name.trim());
    await refreshUser();
    setSnack("Nome atualizado com sucesso!");
    setLoading(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 500 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        Meu Perfil
      </Typography>
      <Card elevation={0}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user?.photoURL}
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.dark",
                fontSize: 28,
              }}
            >
              {user?.displayName?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography fontWeight={700}>{user?.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <TextField
            label="Nome de exibição"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            helperText="Este nome será exibido no ranking e nos palpites."
          />
          <Button
            variant="contained"
            disabled={loading || !name.trim()}
            onClick={handleSave}
          >
            Salvar
          </Button>
        </CardContent>
      </Card>
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
      >
        <Alert severity="success" onClose={() => setSnack(null)}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
