import { socket } from "./common";
import { User } from "../types/auth/User";

// export const fetchActivePlayers = async () => {
//   const response = await safeFetch(`${BASE_PATH}/active-players`, {
//     method: "GET",
//   });
//   if (!response.success) {
//     notifications.show({
//       color: "red",
//       title: "Failed to fetch active players",
//       message: "Encountered an error: " + response.error,
//     });
//   }
//   return response;
// };

export const connect = (user?: User | null) => {
  if (!user || !user.id) return;
  socket.emit("registerUserId", user);
};

export const onActivePlayersChanged = (callback: (players: User[]) => void) => {
  socket.on("activePlayersUpdate", (payload: User[]) => {
    callback(payload);
  });

  return () => {
    socket.off("activePlayersUpdate", callback);
  };
};
