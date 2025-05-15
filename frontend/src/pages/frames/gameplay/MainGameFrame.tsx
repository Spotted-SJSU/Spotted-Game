import React, { useCallback, useEffect, useState } from "react";
import { subscribeToGameplayEvents } from "../../../api/gameplay-api";
import { GameplayEventPayload } from "../../../types/GameplayEventPayload";
import Loading from "../../../components/common/Loading";
import CountdownTimer from "../../../components/gameplay/CountdownTimer";
import ImageWithOverlay from "../../../components/gameplay/ImageWithOverlay";
import { useAuthStore } from "../../../stores/AuthStore";
import { connect } from "../../../api/player-api";
import { Navigate } from "react-router";
import {
  Text,
  Group,
  Box,
  LoadingOverlay,
  Container,
  Stack,
} from "@mantine/core";
import Summary from "../../../components/gameplay/Summary";

export default function MainGameFrame() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [level, setLevel] = useState<GameplayEventPayload | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>();
  const [score, setScore] = useState<number>(0);

  const onMessage = useCallback(
    (event: GameplayEventPayload) => {
      if (event.score === 0) {
        setScore(0);
      }
      setLevel(event);
      if (loading) setLoading(false);
    },
    [loading]
  );

  const isGameplay = () => {
    return level?.levelCondition === "Gameplay";
  };

  useEffect(() => {
    if (score <= 0) {
      setShowSummary(!isGameplay());
    }
  }, [level]);

  useEffect(() => {
    if (score > 0) {
      setShowSummary(true);
    }
  }, [score]);

  useEffect(() => {
    setLoading(true);
    connect(user);
    const stopListening = subscribeToGameplayEvents(onMessage);
    return () => stopListening();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!level) {
    return <Loading />;
  }

  return (
    <Stack align="center">
      <Group justify="space-between" w="max-content">
        <Text>Condition: {level.levelCondition}</Text>
        <Text>Difficulty: {level.difficulty}</Text>
        {score && <Text>Score: {score}</Text>}
        <Text>
          Time left:&nbsp;
          <CountdownTimer duration={level.duration} />
        </Text>
      </Group>
      <Group>
        <Text>Can you find the flag?</Text>
        <img src={level.targetImageUrl} width="24px" height="auto" alt="Flag" />
      </Group>
      <Box pos="relative" w="fit-content">
        <LoadingOverlay
          visible={showSummary || score > 0}
          zIndex="50"
          loaderProps={{
            style: { zIndex: "70" },
            children: <Summary level={level} score={score ?? 0} />,
          }}
        />
        <ImageWithOverlay
          isGameplay={isGameplay()}
          backgroundSrc={level.backgroundImageUrl}
          targetSrc={level.targetImageUrl}
          pos={level.targetCoords}
          opacity={level.opacity}
          onUserSubmitted={(newScore) => setScore(newScore)}
        />
      </Box>
    </Stack>
  );
}
