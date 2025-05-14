import React, { useRef, useState, useEffect } from "react";
import { Bounds } from "../../types/GameplayEventPayload";
import { Image as MantineImage } from "@mantine/core";

interface ImageWithOverlayProps {
  backgroundSrc: string;
  targetSrc: string;
  pos: Bounds;
  opacity: number;
}

export default function ImageWithOverlay(props: ImageWithOverlayProps) {
  const { backgroundSrc, targetSrc, pos, opacity } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFlagLoaded, setIsFlagLoaded] = useState<boolean>(false);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const flagImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset loading states when sources change
    setIsLoading(true);
    setIsFlagLoaded(false);
  }, [backgroundSrc, targetSrc]);

  const drawTargetImage = () => {
    // Preload the flag image
    const flagImg = document.createElement('img');
    flagImg.onload = () => {
      setIsFlagLoaded(true);
    };
    flagImg.src = targetSrc;
    
    // Allow a small delay for layout calculations
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
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
      <MantineImage
        ref={bgImageRef}
        src={backgroundSrc}
        onLoad={drawTargetImage}
        w="100%"
      />
      {!isLoading && isFlagLoaded && (
        <img
          ref={flagImageRef}
          src={targetSrc}
          style={{
            position: "absolute",
            ...getBounds(),
            opacity: opacity,
          }}
          width="80px"
          height="auto"
          alt="Flag"
        />
      )}
    </div>
  );
}
