import { AppShell, Button, Divider, Drawer, Group, Title } from "@mantine/core";
import React, { useState, useEffect } from "react";
import MainGameFrame from "./frames/gameplay/MainGameFrame";
import ActivePlayersFrame from "./frames/gameplay/ActivePlayersFrame";
import ChatFrame from "./frames/gameplay/ChatFrame";
import { useChatService } from "../hooks/useChatService";
import { useAuthStore } from "../stores/AuthStore";
import { useNavigate } from "react-router-dom";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import Leaderboard from "../components/Leaderboard";

export default function Gameplay() {
  const { user, setUser } = useAuthStore();
  const [
    leaderboardOpened,
    { open: openLeaderboard, close: closeLeaderboard },
  ] = useDisclosure();
  
  // Added media query for responsive layout
  const isMobile = useMediaQuery('(max-width: 768px)');
  // State to control sidebar on mobile
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const navigate = useNavigate();

  const leaveGame = () => {
    navigate("/login");
  };

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
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
        p={isMobile ? "xs" : "md"}
        aside={{
          width: 300,
          breakpoint: "md",
          collapsed: { desktop: false, mobile: !sidebarVisible },
        }}
        className="responsive-container"
      >
        <AppShell.Header p="md" className="mobile-full-width">
          <Group justify="space-between" className="mobile-stack">
            <Title order={isMobile ? 3 : 1}>Spot It!</Title>
            <Group>
              {isMobile && (
                <Button variant="light" onClick={toggleSidebar}>
                  {sidebarVisible ? "Hide Chat" : "Show Chat"}
                </Button>
              )}
              <Button variant="outline" onClick={() => openLeaderboard()} size={isMobile ? "xs" : "sm"}>
                Leaderboard
              </Button>
              <Button variant="subtle" onClick={() => leaveGame()} size={isMobile ? "xs" : "sm"}>
                Leave game
              </Button>
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Main className="mobile-full-width">
          <MainGameFrame />
        </AppShell.Main>
        <AppShell.Aside p={isMobile ? "xs" : "md"} w={isMobile ? "100%" : 300} className="mobile-full-width">
          <AppShell.Section p={isMobile ? "xs" : "md"}>
            <ActivePlayersFrame />
          </AppShell.Section>
          <Divider />
          <AppShell.Section p={isMobile ? "xs" : "md"} style={{ height: isMobile ? "300px" : "400px" }}>
            <ChatFrame />
          </AppShell.Section>
        </AppShell.Aside>
      </AppShell>
    </>
  );
}
