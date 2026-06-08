import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout";
import { RequireAdmin, RequireAuth, RequirePlayer } from "./components/router";
import {
  AdminPage,
  LoginPage,
  DashboardPage,
  GroupDetailPage,
  GroupsPage,
  MatchesPage,
  ProfilePage,
} from "./pages";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      // Dashboard: accessible by all authenticated users (shows pending message for 'user')
      { index: true, element: <DashboardPage /> },
      // Profile: accessible by all authenticated users
      { path: "profile", element: <ProfilePage /> },
      // Player+ routes
      {
        path: "groups",
        element: (
          <RequirePlayer>
            <GroupsPage />
          </RequirePlayer>
        ),
      },
      {
        path: "groups/:groupId",
        element: (
          <RequirePlayer>
            <GroupDetailPage />
          </RequirePlayer>
        ),
      },
      {
        path: "my-groups",
        element: (
          <RequirePlayer>
            <GroupsPage />
          </RequirePlayer>
        ),
      },
      {
        path: "matches",
        element: (
          <RequirePlayer>
            <MatchesPage />
          </RequirePlayer>
        ),
      },
      // Admin only
      {
        path: "admin",
        element: (
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
