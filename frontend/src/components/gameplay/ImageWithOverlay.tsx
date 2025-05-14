import React, { useRef, useState, useEffect } from "react";
import { Bounds } from "../../types/GameplayEventPayload";
import { Image as MantineImage } from "@mantine/core";

interface ImageWithOverlayProps {
  isGameplay: boolean;
  backgroundSrc: string;
  targetSrc: string;
  pos: Bounds;
  opacity: number;
}

export default function ImageWithOverlay(props: ImageWithOverlayProps) {
  const { isGameplay, backgroundSrc, targetSrc, pos, opacity } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const bgImageRef = useRef<HTMLImageElement>(null);

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
    // const right = pos.bot_right.x * asd.width;
    // const bottom = pos.bot_right.y * asd.height;
    return {
      left: left,
      top: top,
    };
  };

  return (
    <div
      style={{
        position: "relative",
        width: "fit-content",
        height: "auto",
      }}
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
          width={pos.bot_right.x - pos.top_left.x}
          height="auto"
          alt="Flag"
        />
      )}
    </div>
  );
}
