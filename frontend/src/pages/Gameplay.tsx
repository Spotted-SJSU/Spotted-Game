import { AppShell, Button, Divider, Drawer, Group, Title } from "@mantine/core";
import React from "react";
import MainGameFrame from "./frames/gameplay/MainGameFrame";
import ActivePlayersFrame from "./frames/gameplay/ActivePlayersFrame";
import ChatFrame from "./frames/gameplay/ChatFrame";
import { useChatService } from "../hooks/useChatService";
import { useAuthStore } from "../stores/AuthStore";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import Leaderboard from "../components/Leaderboard";

export default function Gameplay() {
  const { user, setUser } = useAuthStore();
  const [
    leaderboardOpened,
    { open: openLeaderboard, close: closeLeaderboard },
  ] = useDisclosure();
  const navigate = useNavigate();

  const leaveGame = () => {
    navigate("/login");
  };

  // Initialize chat service for real-time updates
  useChatService();

  if (!user) {
    console.warn("USER NOT FOUND, leaving game.");
    leaveGame();
  }

  return (
    <>
      <Drawer
        opened={leaderboardOpened}
        onClose={closeLeaderboard}
        title={<strong>Leaderboard</strong>}
        position="right"
        zIndex={1000}
        overlayProps={{
          blur: 0.1,
        }}
      >
        <Leaderboard />
      </Drawer>
      <AppShell
        withBorder={false}
        header={{ height: 60 }}
        p="md"
        aside={{
          width: 300,
          breakpoint: "md",
          collapsed: { desktop: false, mobile: false },
        }}
      >
        <AppShell.Header p="md">
          <Group justify="space-between">
            <Title>Spot It!</Title>
            <Group>
              <Button variant="outline" onClick={() => openLeaderboard()}>
                Leaderboard
              </Button>
              <Button variant="subtle" onClick={() => leaveGame()}>
                Leave game
              </Button>
            </Group>
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
    </>
  );
}
