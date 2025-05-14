import { AppShell, Button, Divider, Group, Title } from "@mantine/core";
import React from "react";
import MainGameFrame from "./frames/gameplay/MainGameFrame";
import ActivePlayersFrame from "./frames/gameplay/ActivePlayersFrame";
import ChatFrame from "./frames/gameplay/ChatFrame";
import { useChatService } from "../hooks/useChatService";
import { useAuthStore } from "../stores/AuthStore";
import { useNavigate } from "react-router";

export default function Gameplay() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const leaveGame = () => {
    navigate("/login");
  };

  // Initialize chat service for real-time updates
  useChatService();

  if (!user) {
    console.warn("USER NOT FOUND, fallback to test user.");
    setUser({ id: "11", username: "123" });
  }

  return (
    <AppShell withBorder={false} header={{ height: 60 }} p="md">
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Title>Spot It!</Title>
          <Button variant="subtle" onClick={() => leaveGame()}>
            Leave game
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <MainGameFrame />
      </AppShell.Main>
      <AppShell.Aside p="md" w={300}>
        <AppShell.Section p="md">
          <ActivePlayersFrame />
        </AppShell.Section>
        <Divider />
        <AppShell.Section p="md" style={{ height: "400px" }}>
          <ChatFrame />
        </AppShell.Section>
      </AppShell.Aside>
    </AppShell>
  );
}
