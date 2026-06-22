import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";

import { GroupMember } from "../../../../types";

// ─── Ranking tab ──────────────────────────────────────────────────────────────
const RankingTab = ({
  members,
  myUid,
}: {
  members: GroupMember[];
  myUid?: string;
}) => {
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
            <Tooltip title="Placares exatos acertados (critério de desempate)">
              <Chip
                icon={<GpsFixedIcon sx={{ fontSize: 13 }} />}
                label={m.exactScores ?? 0}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11, height: 24, flexShrink: 0 }}
              />
            </Tooltip>
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
};

export default RankingTab;
