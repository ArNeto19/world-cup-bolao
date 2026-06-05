import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppThemeProvider } from "./store/ThemeContext";
import { router } from "./router";
import { AuthProvider } from "./store/AuthContext";
import { MatchesProvider } from "./store/MatchesContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <AuthProvider>
        <MatchesProvider>
          <RouterProvider router={router} />
        </MatchesProvider>
      </AuthProvider>
    </AppThemeProvider>
  </React.StrictMode>,
);
