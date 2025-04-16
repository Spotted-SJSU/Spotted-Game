import { notifications } from "@mantine/notifications";
import { safeFetch, BASE_URL } from "./common";

export const fetchActivePlayers = async () => {
  const response = await safeFetch(`${BASE_URL}/active-players`, {
    method: "GET",
  });
  if (!response.success) {
    notifications.show({
      color: "red",
      title: "Failed to fetch active players",
      message: "Encountered an error: " + response.error,
    });
  }
  return response;
};
