import React, { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme,
  Alert,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SyncIcon from "@mui/icons-material/Sync";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useMatches } from "../../store/MatchesContext";
import { getGroups, getGroupMembers } from "../../services/firestoreService";
import { TeamFlag } from "../../components/TeamFlag";
import { useLiveSync } from "../../hooks";
import { BolaoGroup, Match } from "../../types";

const UPCOMING_WINDOW_MS = 30 * 60 * 1000;

// ─── Pending approval screen ──────────────────────────────────────────────────
function PendingApproval() {
  const { user, signOut } = useAuth();
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Box sx={{ textAlign: "center", maxWidth: 420 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            mx: "auto",
            mb: 3,
            bgcolor: "rgba(255,214,0,0.12)",
            border: "2px solid rgba(255,214,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HourglassEmptyIcon sx={{ fontSize: 36, color: "secondary.main" }} />
        </Box>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Cadastro pendente
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          O administrador deve aprovar seu cadastro para que possa participar de
          grupos.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 3 }}
        >
          Você está autenticado como <strong>{user?.email}</strong>.<br />
          Assim que um administrador aprovar seu acesso, a página será liberada
          automaticamente.
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={signOut}
        >
          Sair da conta
        </Button>
      </Box>
    </Box>
  );
}

// ─── Full dashboard (player + admin) ─────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const { matches } = useMatches();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const apiKey = import.meta.env.VITE_FOOTBALL_DATA_KEY as string | undefined;
  const isAdmin = user?.role === "admin";
  const isPlayer = user?.role === "player" || isAdmin;

  // ── Live sync (admin only) ─────────────────────────────────────────────────
  // const watchableMatches = useMemo<Match[]>(() => {
  //   if (!isAdmin || !apiKey) return [];
  //   const now = Date.now();
  //   return matches.filter((m) => {
  //     if (m.status === "finished") return false;
  //     if (m.status === "live") return true;
  //     const msUntil = m.startTime.getTime() - now;
  //     return msUntil >= 0 && msUntil <= UPCOMING_WINDOW_MS;
  //   });
  // }, [matches, isAdmin, apiKey]);

  // useLiveSync({
  //   apiKey: isAdmin ? (apiKey ?? "") : "",
  //   matches: watchableMatches,
  // });

  // ── Data ──────────────────────────────────────────────────────────────────
  const [myGroups, setMyGroups] = useState<BolaoGroup[]>([]);
  const [myScores, setMyScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isPlayer) return;
    (async () => {
      const all = await getGroups();
      const joined: BolaoGroup[] = [];
      const scores: Record<string, number> = {};
      for (const g of all) {
        const members = await getGroupMembers(g.id);
        const me = members.find((m) => m.uid === user.uid);
        if (me) {
          joined.push(g);
          scores[g.id] = me.score;
        }
      }
      setMyGroups(joined);
      setMyScores(scores);
      setLoading(false);
    })();
  }, [user, isPlayer]);

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 4);

  const stats = [
    {
      label: "Meus Grupos",
      value: myGroups.length,
      icon: <GroupsIcon />,
      color: "primary.main",
    },
    {
      label: "Ao vivo agora",
      value: liveMatches.length,
      icon: <SportsSoccerIcon />,
      color: "error.main",
    },
    {
      label: "Total de partidas",
      value: matches.length,
      icon: <EmojiEventsIcon />,
      color: "secondary.main",
    },
  ];

  // ── Pending user: show only the approval message ──────────────────────────
  if (user?.role === "user") {
    return <PendingApproval />;
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Welcome */}
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>
          Olá, {user?.displayName}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bem-vindo ao Bolão Copa do Mundo 2026
        </Typography>
      </Box>

      {/* Admin banners */}
      {/* {isAdmin && watchableMatches.length > 0 && (
        <Alert
          icon={
            <SyncIcon
              fontSize="small"
              sx={{
                animation: "spin 2s linear infinite",
                "@keyframes spin": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            />
          }
          severity="info"
          sx={{ mb: 2, fontSize: 13 }}
        >
          Sincronização ativa para {watchableMatches.length} partida
          {watchableMatches.length !== 1 ? "s" : ""} — atualizando a cada 3
          minutos.
        </Alert>
      )} */}
      {isAdmin && !apiKey && (
        <Alert severity="warning" sx={{ mb: 2, fontSize: 13 }}>
          <strong>VITE_API_FOOTBALL_KEY</strong> não configurada — sincronização
          automática desativada.
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={4} key={s.label}>
            <Card elevation={0}>
              <CardContent
                sx={{
                  p: { xs: "10px !important", sm: "16px !important" },
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 2 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 36, sm: 44 },
                    height: { xs: 36, sm: 44 },
                    borderRadius: 2,
                    bgcolor: "rgba(128,128,128,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    fontWeight={800}
                    lineHeight={1}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: 10, sm: 12 },
                      display: "block",
                      lineHeight: 1.2,
                    }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* My Groups */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Meus Grupos
            </Typography>
            <Button size="small" onClick={() => navigate("/groups")}>
              Ver todos
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : myGroups.length === 0 ? (
            <Card elevation={0}>
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <GroupsIcon
                  sx={{ fontSize: 36, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Você não participa de nenhum grupo ainda.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => navigate("/groups")}
                >
                  Explorar grupos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={1}>
              {myGroups.map((g) => (
                <Card
                  key={g.id}
                  elevation={0}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { borderColor: "primary.main" },
                    transition: "border-color .2s",
                  }}
                  onClick={() => navigate(`/groups/${g.id}`)}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: "10px 14px !important",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {g.memberCount} participantes
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0, ml: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="primary.main"
                        lineHeight={1}
                      >
                        {myScores[g.id] ?? 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        pts
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Live / Upcoming */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {liveMatches.length > 0 ? "🔴 Ao vivo" : "Próximas Partidas"}
            </Typography>
            <Button size="small" onClick={() => navigate("/matches")}>
              Ver todas
            </Button>
          </Box>
          <Stack spacing={1}>
            {(liveMatches.length > 0
              ? liveMatches.slice(0, 3)
              : upcomingMatches
            ).map((m) => {
              const isLive = m.status === "live";
              return (
                <Card
                  key={m.id}
                  elevation={0}
                  sx={{
                    border: isLive
                      ? "1px solid rgba(255,82,82,0.45)"
                      : undefined,
                  }}
                >
                  <CardContent sx={{ p: "10px 14px !important" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      {m.groupName ? (
                        <Chip
                          label={m.groupName}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 10, height: 18 }}
                        />
                      ) : (
                        <span />
                      )}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
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
                        <Typography variant="caption" color="text.secondary">
                          {format(m.startTime, "dd/MM HH:mm", { locale: ptBR })}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flex: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Typography fontWeight={700} fontSize={13} noWrap>
                          {m.homeTeam.name}
                        </Typography>
                        <TeamFlag countryCode={m.homeTeam.flagCode} size={18} />
                      </Box>
                      <Typography
                        fontWeight={800}
                        fontSize={14}
                        color={isLive ? "error.main" : "text.secondary"}
                        sx={{ minWidth: 50, textAlign: "center" }}
                      >
                        {isLive ? `${m.homeScore} — ${m.awayScore}` : "VS"}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flex: 1,
                        }}
                      >
                        <TeamFlag countryCode={m.awayTeam.flagCode} size={18} />
                        <Typography fontWeight={700} fontSize={13} noWrap>
                          {m.awayTeam.name}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
