import React, { useEffect, useState } from "react";
import { subscribeToGameplayEvents } from "../../../api/gameplay-api";
import type { GameplayEventPayload } from "../../../types/GameplayEventPayload";
import Loading from "../../../components/common/Loading";
import CountdownTimer from "../../../components/gameplay/CountdownTimer";
import ImageWithOverlay from "../../../components/gameplay/ImageWithOverlay";
import { useAuthStore } from "../../../stores/AuthStore";
import { connect } from "../../../api/player-api";
import { Navigate } from "react-router";
import { Text, Title } from "@mantine/core";

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
    const timeout = subscribeToGameplayEvents(onMessage);
    // return () => timeout;
  }, [user]);

  // useEffect(() => {
  //   console.table(level);
  // }, [level]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!level) {
    return <Loading />;
  }

  if (level.levelCondition === "Gameplay") {
    return (
      <>
        <Title order={2}>
          <CountdownTimer duration={level.duration} /> seconds to spot it!
        </Title>
        <ImageWithOverlay
          backgroundSrc={level.backgroundImageUrl}
          targetSrc={level.targetImageUrl}
          pos={level.targetCoords}
        />
        <Text>Difficulty: {level.difficulty}</Text>
      </>
    );
  } else {
    // TODO: summary screen
    return <>Summary screen</>;
  }
}
