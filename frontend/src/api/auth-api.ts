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
  return response;
};

export const register = async (body: LoginAPIRequest) => {
  const response = await safeFetch(`/api/register`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response;
};
