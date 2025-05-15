import React, { useRef, useState, useEffect, useCallback } from "react";
import { Bounds } from "../../types/GameplayEventPayload";
import { Image as MantineImage } from "@mantine/core";
import { useMouse } from "@mantine/hooks";
import { submitClick } from "../../api/gameplay-api";
import { useAuthStore } from "../../stores/AuthStore";

interface ImageWithOverlayProps {
  isGameplay: boolean;
  backgroundSrc: string;
  targetSrc: string;
  pos: Bounds;
  opacity: number;
  onUserSubmitted: (newScore: number) => void;
}

export default function ImageWithOverlay(props: ImageWithOverlayProps) {
  const { user } = useAuthStore();
  const {
    isGameplay,
    backgroundSrc,
    targetSrc,
    pos,
    opacity,
    onUserSubmitted,
  } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const mouse = useMouse();

  useEffect(() => {
    setIsLoading(true);
  }, [backgroundSrc, targetSrc]);

  const drawTargetImage = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const getBounds = () => {
    if (!bgImageRef) return {};

    const bgImageBounds = bgImageRef.current?.getClientRects().item(0)!;
    const left = pos.top_left.x * bgImageBounds.width;
    const top = pos.top_left.y * bgImageBounds.height;
    // const right = pos.bot_right.x * bgImageBounds.width;
    // const bottom = pos.bot_right.y * bgImageBounds.height;
    return {
      left: left,
      top: top,
    };
  };

  const getWidth = () => {
    if (!bgImageRef) return {};
    const bgImageBounds = bgImageRef.current?.getClientRects().item(0)!;
    return bgImageBounds.width;
  };

  const trySubmitClick = async () => {
    if (!isGameplay) return;

    const bgImageBounds = bgImageRef.current?.getClientRects().item(0)!;
    const xNormalized = (mouse.x - bgImageBounds.x) / bgImageBounds.width;
    const yNormalized = (mouse.y - bgImageBounds.y) / bgImageBounds.height;
    console.log(xNormalized, yNormalized);

    const response = await submitClick(user!, xNormalized, yNormalized);
    onUserSubmitted(response!.score);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "fit-content",
        height: "auto",
      }}
      onClick={() => trySubmitClick()}
    >
      <MantineImage
        ref={bgImageRef}
        draggable={false}
        src={backgroundSrc}
        onLoad={drawTargetImage}
        w="100%"
        style={{
          userSelect: "none",
        }}
      />
      {!isLoading && (
        <img
          src={targetSrc}
          draggable={false}
          style={{
            zIndex: 100,
            userSelect: "none",
            position: "absolute",
            ...getBounds(),
            opacity: opacity,
          }}
          width={getWidth() * (pos.bot_right.x - pos.top_left.x)}
          height="auto"
          alt="Flag"
        />
      )}
    </div>
  );
}
