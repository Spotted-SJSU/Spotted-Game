import { notifications } from "@mantine/notifications";
import { safeFetch } from "./common";

export interface LoginAPIRequest {
  username: string;
  password: string;
}

export const login = async (body: LoginAPIRequest) => {
  const response = await safeFetch(`/api/login`, {
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
  const response = await safeFetch(`/api/register`, {
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
