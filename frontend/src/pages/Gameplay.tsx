import { AppShell, Stack, Title } from "@mantine/core";
import React from "react";
import MainGameFrame from "./components/gameplay/MainGameFrame";
import ActivePlayersFrame from "./components/gameplay/ActivePlayersFrame";
import ChatFrame from "./components/gameplay/ChatFrame";

export default function Gameplay() {
  return (
    <AppShell>
      <AppShell.Header p="md">
        <Title>Spot It!</Title>
      </AppShell.Header>
      <AppShell.Main>
        <MainGameFrame />
      </AppShell.Main>
      <AppShell.Aside>
        <Stack>
          <ActivePlayersFrame />
          <ChatFrame />
        </Stack>
      </AppShell.Aside>
    </AppShell>
  );
}
