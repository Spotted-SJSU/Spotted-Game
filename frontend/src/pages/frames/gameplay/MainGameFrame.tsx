import React, { useEffect, useState } from "react";
import { subscribeToGameplayEvents } from "../../../api/gameplay-api";
import type { GameplayEventPayload } from "../../../types/GameplayEventPayload";
import Loading from "../../../components/common/Loading";
import CountdownTimer from "../../../components/gameplay/CountdownTimer";
import ImageWithOverlay from "../../../components/gameplay/ImageWithOverlay";

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
        <ImageWithOverlay
          backgroundSrc={level.backgroundImageUrl}
          targetSrc={level.targetImageUrl}
          pos={level.targetCoords}
        />
        <div>Level: {level.duration}</div>

        <CountdownTimer duration={level.duration} />
      </>
    );
  }
}
