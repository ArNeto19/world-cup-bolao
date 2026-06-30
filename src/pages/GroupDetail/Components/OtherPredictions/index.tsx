import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Tooltip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useAuth } from "../../../../store/AuthContext";
import { getMatchPredictions } from "../../../../services/firestoreService";
import { Prediction, Team } from "../../../../types";

const OtherPredictions = ({
  matchId,
  groupId,
  homeTeam,
  awayTeam,
  actualQualified,
  isKnockout,
}: {
  matchId: string;
  groupId: string;
  homeTeam?: Team;
  awayTeam?: Team;
  actualQualified?: "home" | "away";
  isKnockout?: boolean;
}) => {
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
      {preds.map((p) => {
        const correctQualifiedPred = actualQualified === p.qualifiedTeam;

        return (
          <Box
            key={p.userId}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
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
            {isKnockout && p.qualifiedTeam && (homeTeam || awayTeam) && (
              <Tooltip title="Equipe escolhida para se classificar">
                <Chip
                  icon={<EmojiEventsIcon sx={{ fontSize: 11 }} />}
                  label={
                    p.qualifiedTeam === "home" ? homeTeam?.name : awayTeam?.name
                  }
                  size="small"
                  variant={correctQualifiedPred ? "filled" : "outlined"}
                  color="secondary"
                  sx={{ fontSize: 10, height: 18 }}
                />
              </Tooltip>
            )}
            {p.points !== undefined && (
              <Chip
                label={`+${p.points}`}
                size="small"
                color="secondary"
                sx={{ fontSize: 10, height: 18 }}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

export default OtherPredictions;
