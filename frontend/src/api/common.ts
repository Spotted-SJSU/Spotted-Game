import { notifications } from "@mantine/notifications";

export const safeFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<any> => {
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .catch((error: Error) => {
      showError(error.message);
    });
};

const showError = (errorMessage) => {
  notifications.show({
    color: "red",
    title: "Failed to fetch",
    message: "Error fetching data from the backend! " + errorMessage,
  });
};