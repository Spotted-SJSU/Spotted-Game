import { GameplayEventPayload } from "../types/GameplayEventPayload";
import { socket } from "./common";

export const subscribeToGameplayEvents = (
  callback: (event: GameplayEventPayload) => void
) => {
  console.log("Connecting...");
  socket.on("levelInfo", (payload: GameplayEventPayload) => {
    callback(payload);
  });

  return () => {
    console.log("Disconnecting...");
    socket.off("levelInfo", callback);
  };
};
