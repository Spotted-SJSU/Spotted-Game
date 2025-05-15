import React, { useRef, useState, useEffect, useCallback } from "react";
import { Bounds } from "../../types/GameplayEventPayload";
import { Image as MantineImage, Box } from "@mantine/core";
import { useMouse, useMediaQuery } from "@mantine/hooks";
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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const {
    isGameplay,
    backgroundSrc,
    targetSrc,
    pos,
    opacity,
    onUserSubmitted,
  } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMouse();

  // Adjust container width based on screen size
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // On mobile, take full available width minus padding
        // On desktop, limit to a reasonable size
        if (isMobile) {
          const viewportWidth = window.innerWidth;
          setContainerWidth(viewportWidth - 20); // 10px padding on each side
        } else {
          setContainerWidth(800); // Desktop size
        }
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isMobile]);

  useEffect(() => {
    setIsLoading(true);
  }, [backgroundSrc, targetSrc]);

  const drawTargetImage = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const getBounds = () => {
    if (!bgImageRef?.current) return {};

    const bgImageBounds = bgImageRef.current.getClientRects().item(0)!;
    if (!bgImageBounds) return {};
    
    const left = pos.top_left.x * bgImageBounds.width;
    const top = pos.top_left.y * bgImageBounds.height;
    return {
      left: left,
      top: top,
    };
  };

  const getWidth = () => {
    if (!bgImageRef?.current) return 0;
    const bgImageBounds = bgImageRef.current.getClientRects().item(0)!;
    if (!bgImageBounds) return 0;
    return bgImageBounds.width;
  };

  const trySubmitClick = async (event: React.MouseEvent) => {
    if (!isGameplay || !bgImageRef?.current) return;

    const bgImageBounds = bgImageRef.current.getClientRects().item(0)!;
    if (!bgImageBounds) return;
    
    const rect = bgImageBounds;
    const xNormalized = (event.clientX - rect.x) / rect.width;
    const yNormalized = (event.clientY - rect.y) / rect.height;
    
    console.log(xNormalized, yNormalized);

    const response = await submitClick(user!, xNormalized, yNormalized);
    if (response?.score) {
      onUserSubmitted(response.score);
    }
  };

  return (
    <Box
      ref={containerRef}
      className="game-image-container"
      style={{
        position: "relative",
        width: containerWidth ? `${containerWidth}px` : "100%", 
        maxWidth: "100%",
        height: "auto",
        margin: "0 auto",
      }}
      onClick={trySubmitClick}
    >
      <MantineImage
        ref={bgImageRef}
        draggable={false}
        src={backgroundSrc}
        onLoad={drawTargetImage}
        w="100%"
        className="game-image"
        style={{
          userSelect: "none",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
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
    </Box>
  );
}
