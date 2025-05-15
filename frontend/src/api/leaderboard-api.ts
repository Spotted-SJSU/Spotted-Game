import { notifications } from "@mantine/notifications";
import { BASE_URL, safeFetch } from "./common";

export interface LeaderboardEntryResponse {
  // UserID: number;
  Username: string;
  Score: number;
}

export const fetchLeaderboard = async () => {
  const response = await safeFetch<LeaderboardEntryResponse[]>(
    `${BASE_URL}/leaderboard`,
    {
      method: "GET",
    }
  );
  if (!response.success) {
    notifications.show({
      color: "red",
      title: "Failed to fetch leaderboard",
      message: "Encountered an error: " + response.error,
    });
    return [];
  }
  return response?.data ?? [];
};
