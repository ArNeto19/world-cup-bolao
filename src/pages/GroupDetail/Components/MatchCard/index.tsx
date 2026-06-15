/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { TeamFlag } from "../../../../components/TeamFlag";
import { OtherPredictions } from "../";

import { useMatches } from "../../../../store/MatchesContext";
import { Prediction } from "../../../../types";
import { canEditPrediction, canSeePredictions } from "../../../../utils";

const MatchCard = ({
  match,
  prediction,
  onSave,
  saving,
  groupId,
  now,
}: {
  match: ReturnType<typeof useMatches>["matches"][0];
  prediction?: Prediction;
  onSave: (
    matchId: string,
    home: number,
    away: number,
    startTime: Date,
  ) => Promise<void>;
  saving: string | null;
  groupId: string;
  now: Date;
}) => {
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
    await onSave(match.id, h, a, match.startTime);
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
};

export default MatchCard;
