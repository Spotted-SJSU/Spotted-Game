import React, { useCallback, useEffect, useState } from "react";
import { subscribeToGameplayEvents } from "../../../api/gameplay-api";
import { GameplayEventPayload } from "../../../types/GameplayEventPayload";
import Loading from "../../../components/common/Loading";
import CountdownTimer from "../../../components/gameplay/CountdownTimer";
import ImageWithOverlay from "../../../components/gameplay/ImageWithOverlay";
import { useAuthStore } from "../../../stores/AuthStore";
import { connect } from "../../../api/player-api";
import { Navigate } from "react-router";
import { Text, Group, Modal, Popover } from "@mantine/core";

export default function MainGameFrame() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [level, setLevel] = useState<GameplayEventPayload | null>(null);
  const [opened, setOpened] = useState<boolean>();

  const onMessage = useCallback(
    (event: GameplayEventPayload) => {
      setLevel(event);
      if (loading) setLoading(false);
    },
    [loading]
  );

  const isGameplay = useCallback(() => {
    return level?.levelCondition !== "Gameplay";
  }, [level]);

  useEffect(() => {
    setLoading(true);
    connect(user);
    const stopListening = subscribeToGameplayEvents(onMessage);
    return () => stopListening();
  }, [user]);

  useEffect(() => {
    setOpened(!isGameplay());
  }, [level]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!level) {
    return <Loading />;
  }

  return (
    <>
      <Group justify="space-between" w="max-content">
        {/* TODO: remove condition */}
        <Text>Condition: {level.levelCondition}</Text>
        <Text>Difficulty: {level.difficulty}</Text>
        <Text>
          Time left:&nbsp;
          {<CountdownTimer duration={level.duration} />}
        </Text>
      </Group>
      {opened}
      <Popover
        opened={opened}
        onChange={setOpened}
        width={320}
        shadow="xs"
        withOverlay
        closeOnClickOutside={false}
        closeOnEscape={false}
        overlayProps={{
          zIndex: 10000,
          blur: "2px",
          backgroundOpacity: 0.1,
        }}
        zIndex={10001}
      >
        <Popover.Target>
          <ImageWithOverlay
            // blockSubmission={}
            backgroundSrc={level.backgroundImageUrl}
            targetSrc={level.targetImageUrl}
            pos={level.targetCoords}
            opacity={level.opacity}
          />
        </Popover.Target>
        <Popover.Dropdown>
          <>asd123</>
        </Popover.Dropdown>
      </Popover>
    </>
  );
}
