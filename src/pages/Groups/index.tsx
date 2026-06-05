import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import {
  subscribeGroups,
  joinGroup,
  leaveGroup,
  getGroupMembers,
} from "../../services/firestoreService";
import { BolaoGroup } from "../../types";

const GroupsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<BolaoGroup[]>([]);
  const [memberOf, setMemberOf] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [leaveDialog, setLeaveDialog] = useState<BolaoGroup | null>(null);
  const [snack, setSnack] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const unsub = subscribeGroups(async (g) => {
      setGroups(g);
      if (user) {
        const joined = new Set<string>();
        for (const group of g) {
          const members = await getGroupMembers(group.id);
          if (members.some((m) => m.uid === user.uid)) joined.add(group.id);
        }
        setMemberOf(joined);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleJoin = async (group: BolaoGroup) => {
    if (!user) return;
    setActionLoading(group.id);
    try {
      await joinGroup(group.id, user);
      setMemberOf((prev) => new Set([...prev, group.id]));
      setSnack({
        msg: `Você entrou no grupo "${group.name}"!`,
        type: "success",
      });
    } catch (error) {
      console.error(error)
      setSnack({
        msg: "Erro ao entrar no grupo. Tente novamente.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async () => {
    if (!user || !leaveDialog) return;
    setActionLoading(leaveDialog.id);
    try {
      await leaveGroup(leaveDialog.id, user.uid);
      setMemberOf((prev) => {
        const s = new Set(prev);
        s.delete(leaveDialog.id);
        return s;
      });
      setSnack({
        msg: `Você saiu do grupo "${leaveDialog.name}". Seu progresso foi removido.`,
        type: "success",
      });
    } catch {
      setSnack({ msg: "Erro ao sair do grupo.", type: "error" });
    } finally {
      setLeaveDialog(null);
      setActionLoading(null);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Grupos de Bolão
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Participe de quantos grupos quiser
          </Typography>
        </Box>
      </Box>

      {groups.length === 0 ? (
        <Card elevation={0}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <GroupsIcon sx={{ fontSize: 56, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum grupo disponível ainda.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Aguarde o administrador criar grupos para participar.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {groups.map((group) => {
            const joined = memberOf.has(group.id);
            const isLoading = actionLoading === group.id;
            return (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: joined ? "1px solid rgba(0,200,83,0.4)" : undefined,
                    transition: "border-color 0.2s",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {group.name}
                      </Typography>
                      {joined && (
                        <CheckCircleIcon
                          sx={{ color: "primary.main", fontSize: 20 }}
                        />
                      )}
                    </Box>
                    {group.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {group.description}
                      </Typography>
                    )}
                    <Chip
                      icon={<GroupsIcon />}
                      label={`${group.memberCount} participante${group.memberCount !== 1 ? "s" : ""}`}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
                    {joined && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        Ver Grupo
                      </Button>
                    )}
                    {joined ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        disabled={isLoading}
                        onClick={() => setLeaveDialog(group)}
                      >
                        {isLoading ? <CircularProgress size={16} /> : "Sair"}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        disabled={isLoading || !group.isActive}
                        onClick={() => handleJoin(group)}
                        startIcon={
                          isLoading ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <AddIcon />
                          )
                        }
                      >
                        {group.isActive ? "Participar" : "Encerrado"}
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Leave confirm dialog */}
      <Dialog open={Boolean(leaveDialog)} onClose={() => setLeaveDialog(null)}>
        <DialogTitle>Sair do Grupo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja sair do grupo{" "}
            <strong>{leaveDialog?.name}</strong>?<br />
            <strong>Atenção:</strong> todo o seu progresso e pontuação neste
            grupo será permanentemente removido.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleLeave}>
            Sair do Grupo
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
      >
        <Alert severity={snack?.type} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupsPage;
