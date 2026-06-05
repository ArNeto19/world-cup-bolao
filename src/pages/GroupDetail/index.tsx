import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  TextField,
  Button,
  Divider,
  Tooltip,
  Alert,
  Snackbar,
  IconButton,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "../../store/AuthContext";
import { useMatches } from "../../store/MatchesContext";
import {
  getGroupMembers,
  getUserPredictions,
  upsertPrediction,
  getMatchPredictions,
  isMember,
  subscribeGroups,
} from "../../services/firestoreService";
import { BolaoGroup, GroupMember, Prediction } from "../../types";
import { canEditPrediction, canSeePredictions } from "../../utils/scoring";
import { PHASE_LABELS, PHASE_ORDER } from "../../data/matches";
import { TeamFlag } from "../../components/TeamFlag";
import { useNow } from "../../hooks";

// ─── Other users' predictions ─────────────────────────────────────────────────
function OtherPredictions({
  matchId,
  groupId,
}: {
  matchId: string;
  groupId: string;
}) {
  const { user } = useAuth();
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatchPredictions(matchId, groupId).then((p) => {
      setPreds(p.filter((x) => x.userId !== user?.uid));
      setLoading(false);
    });
  }, [matchId, groupId]);

  if (loading) return <CircularProgress size={14} sx={{ mt: 1 }} />;
  if (preds.length === 0)
    return (
      <Typography variant="caption" color="text.secondary">
        Nenhum palpite registrado.
      </Typography>
    );

  return (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      {preds.map((p) => (
        <Box
          key={p.userId}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Avatar
            sx={{
              width: 20,
              height: 20,
              fontSize: 10,
              bgcolor: "primary.dark",
            }}
          >
            {p.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="caption" flex={1} noWrap>
            {p.username}
          </Typography>
          <Chip
            label={`${p.homeScore} × ${p.awayScore}`}
            size="small"
            sx={{ fontSize: 10, height: 18 }}
          />
          {p.points !== undefined && (
            <Chip
              label={`+${p.points}`}
              size="small"
              color="secondary"
              sx={{ fontSize: 10, height: 18 }}
            />
          )}
        </Box>
      ))}
    </Stack>
  );
}

// ─── Single match card ────────────────────────────────────────────────────────
function MatchCard({
  match,
  prediction,
  onSave,
  saving,
  groupId,
  now,
}: {
  match: ReturnType<typeof useMatches>["matches"][0];
  prediction?: Prediction;
  onSave: (matchId: string, home: number, away: number) => Promise<void>;
  saving: string | null;
  groupId: string;
  now: Date;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [draft, setDraft] = useState<{ home: string; away: string } | null>(
    null,
  );
  const [expanded, setExpanded] = useState(false);

  // Derived from `now` — will re-evaluate every 15 s as `now` changes
  const canEdit = canEditPrediction(match.startTime, match.status, now);
  const canSee = canSeePredictions(match.startTime, now);
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isSaving = saving === match.id;

  // If the edit window just closed while the user had the form open, discard draft
  useEffect(() => {
    if (!canEdit && draft !== null) {
      setDraft(null);
    }
  }, [canEdit]);

  const startEdit = () =>
    setDraft({
      home: String(prediction?.homeScore ?? ""),
      away: String(prediction?.awayScore ?? ""),
    });
  const cancelEdit = () => setDraft(null);

  const handleSave = async () => {
    if (!draft || draft.home === "" || draft.away === "") return;
    const h = parseInt(draft.home, 10);
    const a = parseInt(draft.away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    await onSave(match.id, h, a);
    setDraft(null);
  };

  // Minutes until edit closes — used for countdown label
  const minutesLeft = Math.max(
    0,
    Math.floor(
      (match.startTime.getTime() - 5 * 60_000 - now.getTime()) / 60_000,
    ),
  );

  const flagSize = isMobile ? 20 : 26;

  return (
    <Card
      elevation={0}
      sx={{ border: isLive ? "1px solid rgba(255,82,82,0.45)" : undefined }}
    >
      <CardContent
        sx={{ p: { xs: "10px 12px !important", sm: "14px 16px !important" } }}
      >
        {/* Top row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {match.groupName && (
              <Chip
                label={match.groupName}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10, height: 18 }}
              />
            )}
            {isLive && (
              <Chip
                label="● AO VIVO"
                size="small"
                sx={{
                  bgcolor: "#FF5252",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 10,
                  height: 18,
                }}
              />
            )}
            {isFinished && (
              <Chip
                label="ENCERRADO"
                size="small"
                sx={{ fontSize: 10, height: 18 }}
              />
            )}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {format(
              match.startTime,
              isMobile ? "dd/MM HH:mm" : "dd/MM 'às' HH:mm",
              { locale: ptBR },
            )}
          </Typography>
        </Box>

        {/* Teams + score */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 0.75, sm: 1.5 },
            my: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <Typography
              fontWeight={700}
              fontSize={{ xs: 12, sm: 14 }}
              noWrap
              textAlign="right"
            >
              {match.homeTeam.name}
            </Typography>
            <TeamFlag
              countryCode={match.homeTeam.flagCode}
              size={flagSize}
              style={{ flexShrink: 0 }}
            />
          </Box>

          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: 56, sm: 72 },
              flexShrink: 0,
            }}
          >
            {isLive || isFinished ? (
              <Typography
                fontWeight={800}
                fontSize={{ xs: 18, sm: 22 }}
                color={isLive ? "error.main" : "text.primary"}
                lineHeight={1}
              >
                {match.homeScore} — {match.awayScore}
              </Typography>
            ) : (
              <Typography color="text.secondary" fontWeight={700} fontSize={13}>
                VS
              </Typography>
            )}
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.75, flex: 1 }}
          >
            <TeamFlag
              countryCode={match.awayTeam.flagCode}
              size={flagSize}
              style={{ flexShrink: 0 }}
            />
            <Typography fontWeight={700} fontSize={{ xs: 12, sm: 14 }} noWrap>
              {match.awayTeam.name}
            </Typography>
          </Box>
        </Box>

        {/* Venue */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mb: 1,
            fontSize: { xs: 10, sm: 11 },
          }}
        >
          📍 {isMobile ? match.venue.split("—")[0].trim() : match.venue}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* Prediction header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ fontSize: 10 }}
          >
            MEU PALPITE
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {prediction && draft === null && (
              <Chip
                label={`${prediction.homeScore} × ${prediction.awayScore}`}
                size="small"
                color={
                  isFinished && (prediction.points ?? 0) > 0
                    ? "primary"
                    : "default"
                }
                sx={{ fontWeight: 700, fontSize: 11 }}
              />
            )}
            {isFinished && prediction?.points !== undefined && (
              <Chip
                label={`+${prediction.points} pts`}
                size="small"
                color="secondary"
                sx={{ fontWeight: 800, fontSize: 11 }}
              />
            )}
          </Box>
        </Box>

        {/* Edit form */}
        {canEdit && draft !== null && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mt: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ flex: 1, textAlign: "right", fontSize: 11 }}
            >
              {match.homeTeam.name}
            </Typography>
            <TextField
              size="small"
              type="number"
              value={draft.home}
              onChange={(e) =>
                setDraft((d) => d && { ...d, home: e.target.value })
              }
              inputProps={{
                min: 0,
                style: { textAlign: "center", padding: "4px", width: 36 },
              }}
              sx={{ width: 52 }}
            />
            <Typography fontWeight={800} color="text.secondary">
              ×
            </Typography>
            <TextField
              size="small"
              type="number"
              value={draft.away}
              onChange={(e) =>
                setDraft((d) => d && { ...d, away: e.target.value })
              }
              inputProps={{
                min: 0,
                style: { textAlign: "center", padding: "4px", width: 36 },
              }}
              sx={{ width: 52 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ flex: 1, fontSize: 11 }}
            >
              {match.awayTeam.name}
            </Typography>
            <IconButton
              size="small"
              color="primary"
              disabled={isSaving}
              onClick={handleSave}
              sx={{ p: 0.5 }}
            >
              {isSaving ? (
                <CircularProgress size={16} />
              ) : (
                <CheckIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton size="small" onClick={cancelEdit} sx={{ p: 0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* CTA: register / edit button */}
        {canEdit && draft === null && (
          <Box sx={{ mt: 1 }}>
            {prediction ? (
              <Tooltip
                title={
                  minutesLeft > 0
                    ? `Fecha em ${minutesLeft} min`
                    : "Fecha em menos de 1 min"
                }
              >
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={startEdit}
                  sx={{ fontSize: 11 }}
                >
                  Editar palpite
                  {minutesLeft <= 10 && minutesLeft > 0 && (
                    <Chip
                      label={`${minutesLeft}min`}
                      size="small"
                      color="warning"
                      sx={{ ml: 0.75, fontSize: 9, height: 16 }}
                    />
                  )}
                </Button>
              </Tooltip>
            ) : (
              <Button
                size="small"
                variant="contained"
                startIcon={<SportsSoccerIcon />}
                onClick={startEdit}
                fullWidth
                sx={{ fontSize: 12 }}
              >
                Registrar palpite
              </Button>
            )}
          </Box>
        )}

        {/* Locked */}
        {!canEdit && !prediction && !isLive && !isFinished && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            <LockIcon sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontSize={10}>
              Palpites encerrados para esta partida
            </Typography>
          </Box>
        )}

        {/* Other predictions toggle — visible only after kick-off */}
        {canSee && (
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setExpanded((v) => !v)}
              sx={{ fontSize: 10, p: 0, minWidth: 0 }}
            >
              {expanded ? "Ocultar" : "Ver"} palpites dos participantes
            </Button>
            <Collapse in={expanded}>
              <OtherPredictions matchId={match.id} groupId={groupId} />
            </Collapse>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Ranking tab ──────────────────────────────────────────────────────────────
function RankingTab({
  members,
  myUid,
}: {
  members: GroupMember[];
  myUid?: string;
}) {
  const medalColors = ["#FFD600", "#C0C0C0", "#CD7F32"];
  return (
    <Stack spacing={1}>
      {members.map((m, i) => (
        <Card
          key={m.uid}
          elevation={0}
          sx={{
            border:
              m.uid === myUid
                ? "1px solid rgba(0,200,83,0.5)"
                : i < 3
                  ? "1px solid rgba(255,214,0,0.15)"
                  : undefined,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: "10px 14px !important",
            }}
          >
            <Typography
              fontWeight={800}
              fontSize={18}
              sx={{
                width: 26,
                textAlign: "center",
                flexShrink: 0,
                color: i < 3 ? medalColors[i] : "text.secondary",
              }}
            >
              {i + 1}
            </Typography>
            <Avatar
              src={m.photoURL}
              sx={{
                width: 34,
                height: 34,
                bgcolor: "primary.dark",
                fontSize: 14,
              }}
            >
              {m.displayName?.[0]?.toUpperCase()}
            </Avatar>
            <Typography fontWeight={600} flex={1} noWrap fontSize={14}>
              {m.displayName}
              {m.uid === myUid && (
                <Typography
                  component="span"
                  variant="caption"
                  color="primary.main"
                  sx={{ ml: 0.5 }}
                >
                  (você)
                </Typography>
              )}
            </Typography>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography
                fontWeight={800}
                fontSize={18}
                color={i === 0 ? "secondary.main" : "text.primary"}
                lineHeight={1}
              >
                {m.score}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize={10}
              >
                pts
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const GroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const { matchesByPhase } = useMatches();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const now = useNow();

  const [group, setGroup] = useState<BolaoGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [tabPhase, setTabPhase] = useState<string>("group_stage");
  const [mainTab, setMainTab] = useState(0);
  const [saving, setSaving] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    msg: string;
    severity: "success" | "error";
  } | null>(null);
  const [memberCheck, setMemberCheck] = useState<boolean | null>(null);

  useEffect(() => {
    if (!groupId || !user) return;
    const unsubGroups = subscribeGroups((groups) => {
      const g = groups.find((x) => x.id === groupId);
      if (g) setGroup(g);
    });
    (async () => {
      const isM = await isMember(groupId, user.uid);
      setMemberCheck(isM);
      if (!isM) {
        setLoading(false);
        return;
      }
      const [membersData, predsData] = await Promise.all([
        getGroupMembers(groupId),
        getUserPredictions(user.uid, groupId),
      ]);
      setMembers(membersData);
      const map: Record<string, Prediction> = {};
      predsData.forEach((p) => {
        map[p.matchId] = p;
      });
      setPredictions(map);
      setLoading(false);
    })();
    return unsubGroups;
  }, [groupId, user]);

  const handleSavePrediction = useCallback(
    async (matchId: string, home: number, away: number) => {
      if (!user || !groupId) return;
      setSaving(matchId);
      try {
        const pred: Omit<Prediction, "id"> = {
          matchId,
          userId: user.uid,
          groupId,
          homeScore: home,
          awayScore: away,
          submittedAt: new Date(),
          username: user.displayName,
        };
        await upsertPrediction(pred);
        setPredictions((p) => ({ ...p, [matchId]: pred }));
        setSnack({ msg: "Palpite salvo! ⚽", severity: "success" });
      } catch {
        setSnack({ msg: "Erro ao salvar palpite.", severity: "error" });
      } finally {
        setSaving(null);
      }
    },
    [user, groupId],
  );

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (memberCheck === false)
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="warning"
          action={
            <Button onClick={() => navigate("/groups")}>Ver grupos</Button>
          }
        >
          Você não participa deste grupo.
        </Alert>
      </Box>
    );

  const myMember = members.find((m) => m.uid === user?.uid);
  const myRank = members.findIndex((m) => m.uid === user?.uid) + 1;
  const phases = PHASE_ORDER.filter(
    (p) => (matchesByPhase[p]?.length ?? 0) > 0,
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} noWrap>
          {group?.name}
        </Typography>
        {group?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {group.description}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
          <Chip
            label={`${group?.memberCount} participantes`}
            size="small"
            variant="outlined"
          />
          {myMember && (
            <>
              <Chip
                label={`${myMember.score} pts`}
                size="small"
                color="primary"
              />
              <Chip label={`${myRank}º lugar`} size="small" color="secondary" />
            </>
          )}
        </Box>
      </Box>

      {/* Main tabs */}
      <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mb: 2 }}>
        <Tab
          label="Palpites"
          icon={<SportsSoccerIcon />}
          iconPosition="start"
          sx={{ fontSize: { xs: 12, sm: 14 }, minHeight: 44 }}
        />
        <Tab
          label="Ranking"
          icon={<EmojiEventsIcon />}
          iconPosition="start"
          sx={{ fontSize: { xs: 12, sm: 14 }, minHeight: 44 }}
        />
      </Tabs>

      {mainTab === 0 && (
        <>
          <Tabs
            value={tabPhase}
            onChange={(_, v) => setTabPhase(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2, mx: { xs: -1.5, sm: 0 } }}
          >
            {phases.map((p) => (
              <Tab
                key={p}
                value={p}
                label={PHASE_LABELS[p]}
                sx={{ fontSize: { xs: 11, sm: 12 }, minHeight: 40 }}
              />
            ))}
          </Tabs>

          <Stack spacing={1.5}>
            {(matchesByPhase[tabPhase] ?? []).map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictions[match.id]}
                onSave={handleSavePrediction}
                saving={saving}
                groupId={groupId as string}
                now={now}
              />
            ))}
          </Stack>
        </>
      )}

      {mainTab === 1 && <RankingTab members={members} myUid={user?.uid} />}

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
      >
        <Alert severity={snack?.severity} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupDetailPage;
