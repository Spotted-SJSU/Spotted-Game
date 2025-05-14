import { notifications } from "@mantine/notifications";
import { BASE_URL, safeFetch } from "./common";

export const fetchLeaderboard = async () => {
  const response = await safeFetch(`${BASE_URL}/leaderboard`, {
    method: "GET",
  });
  if (!response.success) {
    notifications.show({
      color: "red",
      title: "Failed to fetch leaderboard",
      message: "Encountered an error: " + response.error,
    });
  }
  return response;
};
