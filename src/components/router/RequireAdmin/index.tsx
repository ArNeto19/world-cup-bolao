import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../../../store/AuthContext";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default RequireAdmin;
