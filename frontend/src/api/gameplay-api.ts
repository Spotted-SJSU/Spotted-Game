import { GameplayEventPayload } from "../types/GameplayEventPayload";
import { socket } from "./common";

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
