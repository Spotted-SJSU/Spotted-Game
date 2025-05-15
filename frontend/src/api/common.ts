import { notifications } from "@mantine/notifications";
import { io } from "socket.io-client";
import { ApiResponse } from "../types/api/ApiResponse";

// Use relative URLs in production, full URLs in development
export const BASE_URL = '';

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

// For Socket.IO, we'll use the current host 
export const socket = io(window.location.origin, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
