import { notifications } from "@mantine/notifications";
import { io } from "socket.io-client";
import { ApiResponse } from "../types/api/ApiResponse";

// export const BASE_URL = '/api';

export const BASE_SCHEME = "http://";
export const BASE_PATH = "localhost:5001";
export const BASE_URL = BASE_SCHEME + BASE_PATH;

export const safeFetch = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> => {
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
    cache: "no-cache",
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

export const socket = io(BASE_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
