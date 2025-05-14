import React, { useEffect, useState } from "react";
import { subscribeToGameplayEvents } from "../../../api/gameplay-api";
import type { GameplayEventPayload } from "../../../types/GameplayEventPayload";
import Loading from "../../../components/common/Loading";
import CountdownTimer from "../../../components/gameplay/CountdownTimer";
import ImageWithOverlay from "../../../components/gameplay/ImageWithOverlay";
import { useAuthStore } from "../../../stores/AuthStore";
import { connect } from "../../../api/player-api";
import { Navigate } from "react-router";
import { Text, Group } from "@mantine/core";

export default function MainGameFrame() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [level, setLevel] = useState<GameplayEventPayload | null>(null);

  const onMessage = (event: GameplayEventPayload) => {
    if (level?.targetImageUrl === event.targetImageUrl) {
      // handles repeated event contents gracefully
      return;
    }

    setLevel(event);
    if (loading) setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    connect(user);
    const stopListening = subscribeToGameplayEvents(onMessage);
    return () => stopListening();
  }, [user]);

  useEffect(() => {
    console.table(level);
  }, [level]);

  if (!user) {
    return <Navigate to="/login" />;
  }

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
          key={`${level.backgroundImageUrl}-${level.targetImageUrl}`}
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
