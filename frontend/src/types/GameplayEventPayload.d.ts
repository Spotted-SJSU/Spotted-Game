export interface GameplayEventPayload {
  levelCondition: "Gameplay" | "Summary";
  difficulty: "Easy" | "Medium" | "Hard";
  backgroundImageUrl: string;
  targetImageUrl: string;
  targetCoords: Bounds;
  duration: number;
  opacity: number;
  score: number;
}

export interface Bounds {
  top_left: Coords;
  bot_right: Coords;
}

export interface Coords {
  x: number;
  y: number;
}
