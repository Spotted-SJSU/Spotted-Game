import { notifications } from "@mantine/notifications";
import { SubmitClickResponse } from "../types/api/SubmitClickResponse";
import { User } from "../types/auth/User";
import { GameplayEventPayload } from "../types/GameplayEventPayload";
import { BASE_URL, safeFetch, socket } from "./common";

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

export const submitClick = async (user: User, x: number, y: number) => {
  const response = await safeFetch<SubmitClickResponse>(`${BASE_URL}/click`, {
    method: "POST",
    body: JSON.stringify({
      userId: user.id,
      x: x,
      y: y,
    }),
  });
  if (!response.success) {
    notifications.show({
      color: "red",
      title: "Failed to register your attempt",
      message: "Encountered an error: " + response.error,
    });
  }
  return response.data;
};
