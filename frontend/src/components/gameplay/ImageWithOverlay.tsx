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

    const asd = bgImageRef.current?.getClientRects().item(0)!;
    const left = pos.top_left.x * asd.width;
    const top = pos.top_left.y * asd.height;
    // const right = pos.bot_right.x * asd.width;
    // const bottom = pos.bot_right.y * asd.height;
    return {
      left: left,
      top: top,
    };
  };

  return (
    <div style={{ position: "relative", width: "fit-content", height: "auto" }}>
      <Image ref={bgImageRef} src={backgroundSrc} onLoad={drawTargetImage} />
      {!isLoading && (
        <img
          src={targetSrc}
          style={{
            position: "absolute",
            ...getBounds(),
            opacity: 0.1, // TODO: Get opacity from backend
          }}
          width="80px"
          height="auto"
          alt="Flag"
        />
      )}
    </div>
  );
}
