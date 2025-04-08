import { notifications } from "@mantine/notifications";

export const safeFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  return fetch(input, {
    ...init,
    headers: {
      "Media-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .catch((error: Error) => {
      notifications.show({
        title: "Failed to fetch",
        message: "Error fetching data from the backend! " + error.message,
      });
    });
};
