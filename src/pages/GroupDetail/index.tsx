/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Stack,
  Button,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

import { MatchCard, RankingTab } from "./Components";

import { useAuth } from "../../store/AuthContext";
import { useMatches } from "../../store/MatchesContext";
import {
  getGroupMembers,
  getUserPredictions,
  upsertPrediction,
  isMember,
  subscribeGroups,
} from "../../services/firestoreService";
import { BolaoGroup, GroupMember, Prediction, MatchStatus } from "../../types";
import { getInitialPhase } from "../../utils";
import { PHASE_LABELS, PHASE_ORDER } from "../../data/matches";
import { useNow } from "../../hooks";

const statusOptions = [
  { value: "all", label: "Todas" },
  { value: "scheduled", label: "Próximas" },
  { value: "live", label: "Ao vivo" },
  { value: "finished", label: "Encerradas" },
];

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
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | string>(
    "scheduled",
  );
  const [userPickedPhase, setUserPickedPhase] = useState(false);

  // Auto-advance to the next non-finished phase once match data is available,
  // but only if the user hasn't manually picked a phase tab themselves.
  useEffect(() => {
    const availablePhases = PHASE_ORDER.filter(
      (p) => (matchesByPhase[p]?.length ?? 0) > 0,
    );
    if (userPickedPhase || availablePhases.length === 0) return;
    setTabPhase(getInitialPhase(availablePhases, matchesByPhase));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchesByPhase, userPickedPhase]);

  const matchesFiltered = (matchesByPhase[tabPhase] ?? [])
    .filter((m) => {
      if (selectedStatus === "all") {
        return true;
      }

      return m.status === selectedStatus;
    })
    .sort((a, b) => {
      if (selectedStatus === "finished") {
        return b.startTime.getTime() - a.startTime.getTime();
      }
      return a.startTime.getTime() - b.startTime.getTime();
    });

  const handleSavePrediction = useCallback(
    async (
      matchId: string,
      home: number,
      away: number,
      startTime: Date,
      qualifiedTeam?: "home" | "away",
    ) => {
      if (!user || !groupId) {
        return;
      }

      const cutoff = new Date(startTime.getTime() - 5 * 60 * 1000);
      if (now >= cutoff) {
        setSnack({
          msg: "Não é mais permitido editar o palpite.",
          severity: "error",
        });
        return;
      }

      setSaving(matchId);
      try {
        const pred: Omit<Prediction, "id"> = {
          matchId,
          userId: user.uid,
          groupId,
          homeScore: home,
          awayScore: away,
          qualifiedTeam,
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

  useEffect(() => {
    if (matchesByPhase[tabPhase].some((m) => m.status === "live")) {
      setSelectedStatus("live");
    }
  }, [matchesByPhase, tabPhase]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (memberCheck === false) {
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
  }

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
            onChange={(_, v) => {
              setTabPhase(v);
              setUserPickedPhase(true);
            }}
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
            <InputLabel>Status das partidas</InputLabel>
            <Select
              sx={{ maxWidth: isMobile ? "35vw" : "10vw" }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {matchesFiltered.map((match) => (
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
