import React from "react";
import { useAuthStore } from "../stores/AuthStore";
import { Navigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Navigate to="/game" />;
}
