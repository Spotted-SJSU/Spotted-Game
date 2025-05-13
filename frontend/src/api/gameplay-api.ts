import { User } from "../types/auth/User";
import { GameplayEventPayload } from "../types/GameplayEventPayload";
import { socket } from "./common";

export const subscribeToGameplayEvents_mock = (
  onMessage: (event: GameplayEventPayload) => void
) => {
  const event: GameplayEventPayload = {
    levelCondition: "Gameplay",
    difficulty: "Easy",
    backgroundImageUrl:
      "https://qvpigh3vz0.ufs.sh/f/q7d8kxMgOteJA5hMKHuz7mdPRpWkZc1Q83feLXnI4YAaNbv5",
    targetImageUrl:
      "https://qvpigh3vz0.ufs.sh/f/q7d8kxMgOteJk0PghVLj8DOZwjuy6tKAl2Te3p4CF59EProh",
    targetCoords: {
      top_left: {
        x: 0.1275,
        y: 0.7016666666666667,
      },
      bot_right: {
        x: 0.24,
        y: 0.7916666666666666,
      },
    },
    duration: 30,
  };

  const payload = {
    levelInfo: event,
  };

  setTimeout(() => onMessage(event), 1000);
};

export const subscribeToGameplayEvents = (
  callback: (event: GameplayEventPayload) => void
) => {
  socket.on("levelInfo", (payload: GameplayEventPayload) => {
    callback(payload);
  });

  return () => {
    socket.off("levelInfo", callback);
  };
};
