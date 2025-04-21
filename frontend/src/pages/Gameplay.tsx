import { AppShell, Divider, Stack, Title } from "@mantine/core";
import React from "react";
import MainGameFrame from "./frames/gameplay/MainGameFrame";
import ActivePlayersFrame from "./frames/gameplay/ActivePlayersFrame";
import ChatFrame from "./frames/gameplay/ChatFrame";
import { useChatService } from "../hooks/useChatService";
import { useAuthStore } from "../stores/AuthStore";
import { Navigate } from "react-router-dom";

export default function Gameplay() {
  const { user } = useAuthStore();
  
  // Initialize chat service for real-time updates
  useChatService();
  
  // Uncomment to enforce authentication
  // if (!user) {
  //   return <Navigate to="/login" />;
  // }
  
  return (
    <AppShell withBorder={false}>
      <AppShell.Header p="md">
        <Title>Spot It!</Title>
      </AppShell.Header>
      <AppShell.Main p="md">
        <MainGameFrame />
      </AppShell.Main>
      <AppShell.Aside p="md" w={300}>
        <AppShell.Section p="md">
          <ActivePlayersFrame />
        </AppShell.Section>
        <Divider />
        <AppShell.Section p="md" style={{ height: '400px' }}>
          <ChatFrame />
        </AppShell.Section>
      </AppShell.Aside>
    </AppShell>
  );
}
