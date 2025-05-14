import React, { useRef, useState } from "react";
import { Bounds } from "../../types/GameplayEventPayload";
import { Image } from "@mantine/core";

interface ImageWithOverlayProps {
  backgroundSrc: string;
  targetSrc: string;
  pos: Bounds;
}

export default function ImageWithOverlay(props: ImageWithOverlayProps) {
  const { backgroundSrc, targetSrc, pos } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const bgImageRef = useRef<HTMLImageElement>(null);

  const drawTargetImage = () => {
    // draw flag after 1.5s to allow large bg images to load
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
    <div style={{ position: "relative", width: "fit-content", height: "auto" }}>
      <Image
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
            opacity: 0.5,
          }}
          width="80px"
          height="auto"
          alt="Flag"
        />
      )}
    </div>
  );
}
