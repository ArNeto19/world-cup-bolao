import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Avatar,
  IconButton,
  Tooltip,
  Autocomplete,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import { TeamFlag } from "../../components/TeamFlag";
import { useAuth } from "../../store/AuthContext";
import {
  createGroup,
  deleteGroup,
  updateGroup,
  subscribeGroups,
  updateMatchScore,
  updateMatchTeams,
  seedMatches,
  getAllUsers,
  setUserRole,
} from "../../services/firestoreService";
import { useMatches } from "../../store/MatchesContext";
import { BolaoGroup, Match, Team, User } from "../../types";
import { PHASE_LABELS, PHASE_ORDER } from "../../data/matches";
import { ALL_TEAMS } from "../../constants";

// ─── Groups tab ───────────────────────────────────────────────────────────────
function GroupsTab() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<BolaoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editGroup, setEditGroup] = useState<BolaoGroup | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BolaoGroup | null>(null);
  const [snack, setSnack] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const unsub = subscribeGroups((g) => {
      setGroups(g);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openCreate = () => {
    setEditGroup(null);
    setForm({ name: "", description: "", isActive: true });
    setDialog(true);
  };
  const openEdit = (g: BolaoGroup) => {
    setEditGroup(g);
    setForm({
      name: g.name,
      description: g.description ?? "",
      isActive: g.isActive,
    });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !user) return;
    setSaving(true);
    try {
      if (editGroup) {
        await updateGroup(editGroup.id, {
          name: form.name,
          description: form.description,
          isActive: form.isActive,
        });
        setSnack({ msg: "Grupo atualizado!", type: "success" });
      } else {
        await createGroup({
          name: form.name,
          description: form.description,
          isActive: form.isActive,
          createdBy: user.uid,
        });
        setSnack({ msg: "Grupo criado!", type: "success" });
      }
      setDialog(false);
    } catch {
      setSnack({ msg: "Erro ao salvar grupo.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGroup(deleteTarget.id);
      setSnack({ msg: "Grupo excluído.", type: "success" });
    } catch {
      setSnack({ msg: "Erro ao excluir.", type: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          size="small"
        >
          Novo Grupo
        </Button>
      </Box>
      <Stack spacing={1.5}>
        {groups.map((g) => (
          <Card key={g.id} elevation={0}>
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: "10px 14px !important",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>
                  {g.name}
                </Typography>
                {g.description && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {g.description}
                  </Typography>
                )}
                <Box
                  sx={{ display: "flex", gap: 0.75, mt: 0.5, flexWrap: "wrap" }}
                >
                  <Chip
                    icon={<GroupsIcon />}
                    label={`${g.memberCount}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 10 }}
                  />
                  <Chip
                    label={g.isActive ? "Ativo" : "Encerrado"}
                    size="small"
                    color={g.isActive ? "success" : "default"}
                    sx={{ fontSize: 10 }}
                  />
                </Box>
              </Box>
              <IconButton size="small" onClick={() => openEdit(g)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteTarget(g)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editGroup ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome do grupo"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Descrição (opcional)"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              fullWidth
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                />
              }
              label="Aceita novos participantes"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={saving || !form.name.trim()}
            onClick={handleSave}
          >
            {saving ? <CircularProgress size={18} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle>Excluir Grupo</DialogTitle>
        <DialogContent>
          Excluir <strong>{deleteTarget?.name}</strong>? Todos os membros serão
          removidos.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
      >
        <Alert severity={snack?.type} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── Matches tab ──────────────────────────────────────────────────────────────
function MatchesTab() {
  const { matchesByPhase } = useMatches();
  const [phase, setPhase] = useState("group_stage");

  const [scoreDialog, setScoreDialog] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [status, setStatus] = useState<"live" | "finished">("live");
  const [savingScore, setSavingScore] = useState(false);

  const [teamsDialog, setTeamsDialog] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [savingTeams, setSavingTeams] = useState(false);

  const [seeded, setSeeded] = useState(false);
  const [snack, setSnack] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const openScore = (m: Match) => {
    setScoreDialog(m);
    setHomeScore(String(m.homeScore ?? ""));
    setAwayScore(String(m.awayScore ?? ""));
    setStatus(
      m.status === "live" || m.status === "finished" ? m.status : "live",
    );
  };

  const openTeams = (m: Match) => {
    setTeamsDialog(m);
    setHomeTeam(ALL_TEAMS.find((t) => t.code === m.homeTeam.code) ?? null);
    setAwayTeam(ALL_TEAMS.find((t) => t.code === m.awayTeam.code) ?? null);
  };

  const handleSaveScore = async () => {
    if (!scoreDialog) return;
    const h = parseInt(homeScore, 10);
    const a = parseInt(awayScore, 10);
    if (isNaN(h) || isNaN(a)) return;
    setSavingScore(true);
    try {
      await updateMatchScore(scoreDialog.id, h, a, status);
      setSnack({
        msg:
          status === "finished"
            ? "Pontuações recalculadas!"
            : "Placar ao vivo atualizado!",
        type: "success",
      });
      setScoreDialog(null);
    } catch {
      setSnack({ msg: "Erro ao salvar placar.", type: "error" });
    } finally {
      setSavingScore(false);
    }
  };

  const handleSaveTeams = async () => {
    if (!teamsDialog || !homeTeam || !awayTeam) return;
    if (homeTeam.code === awayTeam.code) {
      setSnack({ msg: "Os dois times não podem ser iguais.", type: "error" });
      return;
    }
    setSavingTeams(true);
    try {
      await updateMatchTeams(teamsDialog.id, homeTeam, awayTeam);
      setSnack({
        msg: `Partida #${teamsDialog.matchNumber} atualizada!`,
        type: "success",
      });
      setTeamsDialog(null);
    } catch {
      setSnack({ msg: "Erro ao atualizar times.", type: "error" });
    } finally {
      setSavingTeams(false);
    }
  };

  const isTBD = (m: Match) =>
    m.homeTeam.code === "TBD" || m.awayTeam.code === "TBD";
  const phases = PHASE_ORDER.filter(
    (p) => (matchesByPhase[p]?.length ?? 0) > 0,
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Tooltip title="Importa os 104 jogos para o Firestore (execute apenas uma vez)">
          <Button
            variant="outlined"
            size="small"
            onClick={async () => {
              await seedMatches();
              setSeeded(true);
              setSnack({ msg: "Partidas importadas!", type: "success" });
            }}
            disabled={seeded}
          >
            Importar Partidas
          </Button>
        </Tooltip>
      </Box>

      <Tabs
        value={phase}
        onChange={(_, v) => setPhase(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {phases.map((p) => (
          <Tab
            key={p}
            value={p}
            label={PHASE_LABELS[p]}
            sx={{ fontSize: 11, minHeight: 40 }}
          />
        ))}
      </Tabs>

      <Stack spacing={1}>
        {(matchesByPhase[phase] ?? []).map((m) => (
          <Card
            key={m.id}
            elevation={0}
            sx={{
              border: isTBD(m) ? "1px solid rgba(255,167,38,0.35)" : undefined,
            }}
          >
            <CardContent sx={{ p: "8px 12px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 10 }}
                  >
                    #{m.matchNumber} ·{" "}
                    {format(m.startTime, "dd/MM HH:mm", { locale: ptBR })}
                    {m.groupName ? ` · ${m.groupName}` : ""}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.25,
                    }}
                  >
                    <TeamFlag countryCode={m.homeTeam.flagCode} size={16} />
                    <Typography fontWeight={600} fontSize={13} noWrap>
                      {m.homeTeam.name}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      fontSize={12}
                      sx={{ mx: 0.25 }}
                    >
                      ×
                    </Typography>
                    <Typography fontWeight={600} fontSize={13} noWrap>
                      {m.awayTeam.name}
                    </Typography>
                    <TeamFlag countryCode={m.awayTeam.flagCode} size={16} />
                  </Box>
                </Box>

                {/* Status chip */}
                <Chip
                  label={
                    m.status === "live"
                      ? "🔴"
                      : m.status === "finished"
                        ? "✓"
                        : "—"
                  }
                  size="small"
                  color={
                    m.status === "live"
                      ? "error"
                      : m.status === "finished"
                        ? "success"
                        : "default"
                  }
                  sx={{ fontSize: 10, height: 20, minWidth: 0 }}
                />

                {/* Score chip */}
                {(m.status === "live" || m.status === "finished") && (
                  <Chip
                    label={`${m.homeScore}–${m.awayScore}`}
                    size="small"
                    sx={{ fontSize: 11, height: 20, fontWeight: 700 }}
                  />
                )}

                <Button
                  size="small"
                  variant={isTBD(m) ? "contained" : "outlined"}
                  color={isTBD(m) ? "warning" : "inherit"}
                  onClick={() => openTeams(m)}
                  sx={{ fontSize: 10, py: 0.25, px: 0.75, minWidth: 0 }}
                >
                  Times
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => openScore(m)}
                  sx={{ fontSize: 10, py: 0.25, px: 0.75, minWidth: 0 }}
                >
                  Placar
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Score dialog */}
      <Dialog
        open={Boolean(scoreDialog)}
        onClose={() => setScoreDialog(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontSize: 16 }}>Atualizar Placar</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              mt: 0.5,
            }}
          >
            <TeamFlag
              countryCode={scoreDialog?.homeTeam.flagCode ?? "TBD"}
              size={20}
            />
            <Typography variant="body2" color="text.secondary" flex={1} noWrap>
              {scoreDialog?.homeTeam.name} × {scoreDialog?.awayTeam.name}
            </Typography>
            <TeamFlag
              countryCode={scoreDialog?.awayTeam.flagCode ?? "TBD"}
              size={20}
            />
          </Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              label={scoreDialog?.homeTeam.name}
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              inputProps={{ min: 0 }}
              size="small"
              sx={{ flex: 1 }}
            />
            <Typography fontWeight={800}>×</Typography>
            <TextField
              label={scoreDialog?.awayTeam.name}
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              inputProps={{ min: 0 }}
              size="small"
              sx={{ flex: 1 }}
            />
          </Stack>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value as "live" | "finished")}
            >
              <MenuItem value="live">Ao Vivo</MenuItem>
              <MenuItem value="finished">Encerrado (calcula pontos)</MenuItem>
            </Select>
          </FormControl>
          {status === "finished" && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: 12 }}>
              As pontuações serão recalculadas em todos os grupos.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScoreDialog(null)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={savingScore}
            onClick={handleSaveScore}
          >
            {savingScore ? <CircularProgress size={18} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teams dialog */}
      <Dialog
        open={Boolean(teamsDialog)}
        onClose={() => setTeamsDialog(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontSize: 16 }}>
          Times — Partida #{teamsDialog?.matchNumber}
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 2 }}
          >
            {PHASE_LABELS[teamsDialog?.phase ?? "group_stage"]}
            {teamsDialog?.groupName ? ` · ${teamsDialog.groupName}` : ""}
            {" · "}
            {teamsDialog &&
              format(teamsDialog.startTime, "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
          </Typography>
          <Stack spacing={2}>
            <Autocomplete
              options={ALL_TEAMS}
              value={homeTeam}
              onChange={(_, v) => setHomeTeam(v)}
              getOptionLabel={(t) => t.name}
              isOptionEqualToValue={(a, b) => a.code === b.code}
              renderOption={(props, t) => (
                <Box
                  component="li"
                  {...props}
                  key={t.code}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <TeamFlag countryCode={t.flagCode} size={18} />
                  <Typography fontSize={14}>{t.name}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: "auto" }}
                  >
                    {t.code}
                  </Typography>
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Time da Casa" size="small" />
              )}
            />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography fontWeight={800} color="text.secondary">
                ×
              </Typography>
            </Box>
            <Autocomplete
              options={ALL_TEAMS}
              value={awayTeam}
              onChange={(_, v) => setAwayTeam(v)}
              getOptionLabel={(t) => t.name}
              isOptionEqualToValue={(a, b) => a.code === b.code}
              renderOption={(props, t) => (
                <Box
                  component="li"
                  {...props}
                  key={t.code}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <TeamFlag countryCode={t.flagCode} size={18} />
                  <Typography fontSize={14}>{t.name}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: "auto" }}
                  >
                    {t.code}
                  </Typography>
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Time Visitante" size="small" />
              )}
            />
          </Stack>
          {homeTeam && awayTeam && homeTeam.code !== awayTeam.code && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mt: 2,
              }}
            >
              <TeamFlag countryCode={homeTeam.flagCode} size={22} />
              <Typography fontWeight={700} fontSize={14}>
                {homeTeam.name} × {awayTeam.name}
              </Typography>
              <TeamFlag countryCode={awayTeam.flagCode} size={22} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamsDialog(null)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={
              savingTeams ||
              !homeTeam ||
              !awayTeam ||
              homeTeam?.code === awayTeam?.code
            }
            onClick={handleSaveTeams}
          >
            {savingTeams ? <CircularProgress size={18} /> : "Salvar"}
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
}

// ─── Users tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    getAllUsers().then((u) => {
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const setRole = async (u: User, newRole: User["role"]) => {
    try {
      await setUserRole(u.uid, newRole);
      setUsers((prev) =>
        prev.map((x) => (x.uid === u.uid ? { ...x, role: newRole } : x)),
      );
      const labels: Record<User["role"], string> = {
        admin: "administrador",
        player: "player",
        user: "pendente",
      };
      setSnack({
        msg: `${u.displayName} agora é ${labels[newRole]}.`,
        type: "success",
      });
    } catch {
      setSnack({ msg: "Erro ao atualizar cargo.", type: "error" });
    }
  };

  const pendingUsers = users.filter((u) => u.role === "user");
  const approvedUsers = users.filter((u) => u.role !== "user");

  const roleChip = (u: User) => {
    if (u.role === "admin")
      return (
        <Chip
          label="Admin"
          size="small"
          color="secondary"
          sx={{ fontSize: 10 }}
        />
      );
    if (u.role === "player")
      return (
        <Chip
          label="Player"
          size="small"
          color="primary"
          sx={{ fontSize: 10 }}
        />
      );
    return (
      <Chip
        label="Pendente"
        size="small"
        color="warning"
        sx={{ fontSize: 10 }}
      />
    );
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      {/* Pending approvals */}
      {pendingUsers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <HourglassEmptyIcon sx={{ fontSize: 18, color: "warning.main" }} />
            <Typography fontWeight={700} fontSize={14} color="warning.main">
              Aguardando aprovação ({pendingUsers.length})
            </Typography>
          </Box>
          <Stack spacing={1}>
            {pendingUsers.map((u) => (
              <Card
                key={u.uid}
                elevation={0}
                sx={{ border: "1px solid rgba(255,167,38,0.35)" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: "10px 14px !important",
                  }}
                >
                  <Avatar
                    src={u.photoURL}
                    sx={{ width: 34, height: 34, fontSize: 14 }}
                  >
                    {u.displayName?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={600} fontSize={14} noWrap>
                      {u.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {u.email}
                    </Typography>
                  </Box>
                  {roleChip(u)}
                  <Tooltip title="Aprovar como player">
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => setRole(u, "player")}
                      sx={{ fontSize: 11, whiteSpace: "nowrap" }}
                    >
                      Aprovar
                    </Button>
                  </Tooltip>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* Approved users */}
      <Box>
        {approvedUsers.length > 0 && (
          <Typography
            fontWeight={700}
            fontSize={14}
            sx={{ mb: 1.5 }}
            color="text.secondary"
          >
            Usuários aprovados ({approvedUsers.length})
          </Typography>
        )}
        <Stack spacing={1}>
          {approvedUsers.map((u) => (
            <Card key={u.uid} elevation={0}>
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: "10px 14px !important",
                }}
              >
                <Avatar
                  src={u.photoURL}
                  sx={{ width: 34, height: 34, fontSize: 14 }}
                >
                  {u.displayName?.[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={600} fontSize={14} noWrap>
                    {u.displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {u.email}
                  </Typography>
                </Box>
                {roleChip(u)}
                {u.uid !== me?.uid && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {/* Demote / promote to player */}
                    {u.role === "admin" && (
                      <Tooltip title="Rebaixar para player">
                        <IconButton
                          size="small"
                          onClick={() => setRole(u, "player")}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {u.role === "player" && (
                      <Tooltip title="Revogar acesso (pendente)">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => setRole(u, "user")}
                        >
                          <HourglassEmptyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Toggle admin */}
                    <Tooltip
                      title={
                        u.role === "admin" ? "Remover admin" : "Tornar admin"
                      }
                    >
                      <IconButton
                        size="small"
                        color={u.role === "admin" ? "default" : "secondary"}
                        onClick={() =>
                          setRole(u, u.role === "admin" ? "player" : "admin")
                        }
                      >
                        <AdminPanelSettingsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
      >
        <Alert severity={snack?.type} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role !== "admin") return;
    getAllUsers().then((all) =>
      setPendingCount(all.filter((u) => u.role === "user").length),
    );
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Acesso negado. Apenas administradores podem acessar esta área.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight={800}
        sx={{ mb: 2 }}
      >
        Administração
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab
          label="Grupos"
          sx={{ fontSize: { xs: 12, sm: 14 }, minHeight: 44 }}
        />
        <Tab
          label="Partidas"
          sx={{ fontSize: { xs: 12, sm: 14 }, minHeight: 44 }}
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              Usuários
              {pendingCount > 0 && (
                <Chip
                  label={pendingCount}
                  size="small"
                  color="warning"
                  sx={{ fontSize: 10, height: 18, minWidth: 18 }}
                />
              )}
            </Box>
          }
          sx={{ fontSize: { xs: 12, sm: 14 }, minHeight: 44 }}
        />
      </Tabs>
      {tab === 0 && <GroupsTab />}
      {tab === 1 && <MatchesTab />}
      {tab === 2 && <UsersTab />}
    </Box>
  );
};

export default AdminPage;
