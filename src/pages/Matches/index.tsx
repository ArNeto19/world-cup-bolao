import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { TeamFlag } from "../../components/TeamFlag";

import { useMatches } from "../../store/MatchesContext";
import { normaliseString } from "../../utils";
import { PHASE_LABELS, PHASE_ORDER } from "../../data/matches";

const MatchesPage = () => {
  const { matchesByPhase, matches, loading } = useMatches();
  const [phase, setPhase] = useState("group_stage");
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const query = normaliseString(search);

  // When a search is active, show results across all phases; otherwise filter by selected tab
  const filteredMatches = useMemo(() => {
    if (!query) return matchesByPhase[phase] ?? [];
    return matches.filter(
      (m) =>
        normaliseString(m.homeTeam.name).includes(query) ||
        normaliseString(m.awayTeam.name).includes(query) ||
        m.homeTeam.code.toLowerCase().includes(query) ||
        m.awayTeam.code.toLowerCase().includes(query),
    );
  }, [query, matches, matchesByPhase, phase]);

  const phases = PHASE_ORDER.filter(
    (p) => (matchesByPhase[p]?.length ?? 0) > 0,
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ mb: 2, px: { xs: 0.5, md: 0 } }}
      >
        Partidas — Copa 2026
      </Typography>

      {/* Search input */}
      <TextField
        placeholder="Buscar por seleção…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        autoComplete="off"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearch("")} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Phase tabs — hidden while searching */}
      {!query && (
        <Tabs
          value={phase}
          onChange={(_, v) => setPhase(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, mx: { xs: -1.5, md: 0 } }}
        >
          {phases.map((p) => (
            <Tab
              key={p}
              value={p}
              label={PHASE_LABELS[p]}
              sx={{ fontSize: { xs: 11, sm: 13 } }}
            />
          ))}
        </Tabs>
      )}

      {/* Search result header */}
      {query && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {filteredMatches.length === 0
            ? "Nenhuma partida encontrada."
            : `${filteredMatches.length} partida${filteredMatches.length !== 1 ? "s" : ""} encontrada${filteredMatches.length !== 1 ? "s" : ""}`}
        </Typography>
      )}

      <Stack spacing={1.5}>
        {filteredMatches.map((m) => {
          const isLive = m.status === "live";
          const isFinished = m.status === "finished";

          // Highlight matched team name
          const highlight = (name: string) => {
            if (!query) return name;
            const idx = normaliseString(name).indexOf(query);
            if (idx === -1) return name;
            return (
              <>
                {name.slice(0, idx)}
                <Box
                  component="span"
                  sx={{
                    bgcolor: "rgba(0,200,83,0.25)",
                    borderRadius: 0.5,
                    px: 0.25,
                  }}
                >
                  {name.slice(idx, idx + query.length)}
                </Box>
                {name.slice(idx + query.length)}
              </>
            );
          };

          return (
            <Card
              key={m.id}
              elevation={0}
              sx={{
                border: isLive ? "1px solid rgba(255,82,82,0.45)" : undefined,
              }}
            >
              <CardContent
                sx={{
                  p: { xs: "10px 12px !important", sm: "14px 16px !important" },
                }}
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
                    {/* Show phase chip when searching across phases */}
                    {query && (
                      <Chip
                        label={PHASE_LABELS[m.phase]}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    )}
                    {m.groupName && !query && (
                      <Chip
                        label={m.groupName}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    )}
                    {m.groupName && query && (
                      <Chip
                        label={m.groupName}
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
                      m.startTime,
                      isMobile ? "dd/MM HH:mm" : "EEE, dd/MM 'às' HH:mm",
                      { locale: ptBR },
                    )}
                  </Typography>
                </Box>

                {/* Teams */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: 1, sm: 2 },
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
                      fontSize={{ xs: 13, sm: 15 }}
                      noWrap
                      textAlign="right"
                    >
                      {highlight(m.homeTeam.name)}
                    </Typography>
                    <TeamFlag
                      countryCode={m.homeTeam.flagCode}
                      size={isMobile ? 20 : 24}
                    />
                  </Box>

                  <Box
                    sx={{
                      textAlign: "center",
                      minWidth: { xs: 60, sm: 80 },
                      flexShrink: 0,
                    }}
                  >
                    {isLive || isFinished ? (
                      <Typography
                        variant={isMobile ? "h6" : "h5"}
                        fontWeight={800}
                        color={isLive ? "error.main" : "text.primary"}
                      >
                        {m.homeScore} — {m.awayScore}
                      </Typography>
                    ) : (
                      <Typography
                        color="text.secondary"
                        fontWeight={700}
                        fontSize={13}
                      >
                        VS
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      flex: 1,
                    }}
                  >
                    <TeamFlag
                      countryCode={m.awayTeam.flagCode}
                      size={isMobile ? 20 : 24}
                    />
                    <Typography
                      fontWeight={700}
                      fontSize={{ xs: 13, sm: 15 }}
                      noWrap
                    >
                      {highlight(m.awayTeam.name)}
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
                    mt: 0.75,
                    fontSize: { xs: 10, sm: 11 },
                  }}
                >
                  📍 {isMobile ? m.venue.split("—")[0].trim() : m.venue}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default MatchesPage;
