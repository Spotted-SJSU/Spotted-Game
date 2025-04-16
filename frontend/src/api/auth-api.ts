import { notifications } from "@mantine/notifications";
import { safeFetch, BASE_URL } from "./common";

export interface LoginAPIRequest {
  username: string;
  password: string;
}

export const login = async (body: LoginAPIRequest) => {
  const response = await safeFetch(`${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.success) {
    notifications.show({
      color: "red",
      title: "Failed to log in",
      message: "Encountered an error: " + response.error,
    });
  }
  return response;
};

export const register = async (body: LoginAPIRequest) => {
  const response = await safeFetch(`${BASE_URL}/register`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.success) {
    notifications.show({
      color: "red",
      title: "Failed to register user",
      message: "Encountered an error: " + response.error,
    });
  }
  return response;
};
