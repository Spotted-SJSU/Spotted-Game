import React, { useCallback, useEffect, useState } from "react";
import { subscribeToGameplayEvents } from "../../../api/gameplay-api";
import { GameplayEventPayload } from "../../../types/GameplayEventPayload";
import Loading from "../../../components/common/Loading";
import CountdownTimer from "../../../components/gameplay/CountdownTimer";
import ImageWithOverlay from "../../../components/gameplay/ImageWithOverlay";
import { useAuthStore } from "../../../stores/AuthStore";
import { connect } from "../../../api/player-api";
import { Navigate } from "react-router-dom";
import {
  Text,
  Group,
  Box,
  LoadingOverlay,
  Container,
  Stack,
  Flex,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Summary from "../../../components/gameplay/Summary";

export default function MainGameFrame() {
  const { user } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loading, setLoading] = useState<boolean>(false);
  const [level, setLevel] = useState<GameplayEventPayload | null>(null);
  const [previousCondition, setPreviousCondition] = useState<string>();
  const [showSummary, setShowSummary] = useState<boolean>();
  const [score, setScore] = useState<number>(0);

  const onMessage = (event: GameplayEventPayload) => {
    setLevel(event);
    setLoading(false);
  };

  const isGameplay = () => {
    return level?.levelCondition === "Gameplay";
  };

  useEffect(() => {
    if (
      level?.levelCondition === "Gameplay" &&
      previousCondition !== level.levelCondition
    ) {
      setScore(0);
      setShowSummary(false);
    } else if (score <= 0) {
      setShowSummary(!isGameplay());
    }
    setPreviousCondition(level?.levelCondition);
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
    <Container className="responsive-container" p={0} fluid>
      <Stack align="center" gap={isMobile ? "xs" : "md"}>
        <Flex 
          direction={isMobile ? "column" : "row"} 
          wrap="wrap" 
          gap={isMobile ? "xs" : "md"}
          align="center" 
          justify="center"
          className={isMobile ? "mobile-stack mobile-text-center" : ""}
        >
          <Text fw={600} size={isMobile ? "sm" : "md"}>
            {level.levelCondition === "Gameplay" ? "Find the flag!" : "Game Summary"}
          </Text>
          <Text size={isMobile ? "xs" : "sm"}>Difficulty: {level.difficulty}</Text>
          {score > 0 && (
            <Text size={isMobile ? "xs" : "sm"} fw={700} c="green">
              Score: {score}
            </Text>
          )}
          <Text size={isMobile ? "xs" : "sm"}>
            Time left:&nbsp;
            <CountdownTimer
              key={`${level.levelCondition}-${level.duration}`}
              duration={level.duration}
            />
          </Text>
        </Flex>

        <Group justify="center" mb={isMobile ? 5 : 10}>
          <Text size={isMobile ? "xs" : "sm"}>Target:</Text>
          <img 
            src={level.targetImageUrl} 
            width={isMobile ? "16px" : "24px"} 
            height="auto" 
            alt="Flag" 
          />
        </Group>

        <Box pos="relative" w="100%" className="mobile-full-width">
          <LoadingOverlay
            visible={showSummary || score > 0}
            zIndex={50}
            loaderProps={{
              style: { zIndex: 70 },
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
    </Container>
  );
}
