import { AppShell, Divider, Stack, Title } from "@mantine/core";
import React from "react";
import MainGameFrame from "./frames/gameplay/MainGameFrame";
import ActivePlayersFrame from "./frames/gameplay/ActivePlayersFrame";
import ChatFrame from "./frames/gameplay/ChatFrame";

export default function Gameplay() {
  return (
    <AppShell withBorder={false}>
      <AppShell.Header p="md">
        <Title>Spot It!</Title>
      </AppShell.Header>
      <AppShell.Main p="md">
        <MainGameFrame />
      </AppShell.Main>
      <AppShell.Aside p="md">
        <AppShell.Section p="md">
          <ActivePlayersFrame />
        </AppShell.Section>
        <Divider />
        <AppShell.Section p="md">
          <ChatFrame />
        </AppShell.Section>
      </AppShell.Aside>
    </AppShell>
  );
}
