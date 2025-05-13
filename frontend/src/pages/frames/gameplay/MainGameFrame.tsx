import React, { useEffect, useState } from "react";
import { subscribeToGameplayEvents } from "../../../api/gameplay-api";
import type { GameplayEventPayload } from "../../../types/GameplayEventPayload";
import Loading from "../../../components/common/Loading";
import CountdownTimer from "../../../components/gameplay/CountdownTimer";
import ImageWithOverlay from "../../../components/gameplay/ImageWithOverlay";
import { Group, Text } from "@mantine/core";

export default function MainGameFrame() {
  const [loading, setLoading] = useState<boolean>(false);
  const [level, setLevel] = useState<GameplayEventPayload | null>(null);

  const onMessage = (event: GameplayEventPayload) => {
    setLevel(event);
    if (loading) setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    subscribeToGameplayEvents(onMessage);
  }, []);

  useEffect(() => {
    console.table(level);
  }, [level]);

  if (!level) {
    return <Loading />;
  }

  if (level.levelCondition === "Gameplay") {
    return (
      <>
        <Group justify="space-between" w="max-content">
          <Text>Difficulty: {level.difficulty}</Text>
          <Text>
            Time left:&nbsp;
            {<CountdownTimer duration={level.duration} />}
          </Text>
        </Group>
        <ImageWithOverlay
          backgroundSrc={level.backgroundImageUrl}
          targetSrc={level.targetImageUrl}
          pos={level.targetCoords}
        />
      </>
    );
  } else {
    return (
      <>
        <Text>Waiting for the next round!</Text>
      </>
    );
  }
}
