import React, { useState } from "react";
import { useAuthStore } from "../stores/AuthStore";
import {
  Button,
  Container,
  Divider,
  Flex,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { login, register } from "../api/auth-api";

export default function Login() {
  const { user, setUser, resetUser } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm({});

  function showUserInfo() {
    return (
      <Flex
        direction="column"
        justify="center"
        align="center"
        h="100%"
        gap="16"
      >
        <Title>Spotted</Title>
        <Divider />
        <Text>Logged in as {user!.username}!</Text>
        <Button type="reset" onClick={() => resetUser()}>
          Logout
        </Button>
      </Flex>
    );
  }

  function showLoginForm() {
    async function doRegister() {
      setLoading(true);
      const { username, password } = form.getValues();
      const response = await register({
        username,
        password,
      });
      if (!response.success) {
        setLoading(false);
        return;
      }

      setUser({
        userID: "", // TODO: populate from response
        username: username,
      });
      setLoading(false);
      form.resetTouched();
    }

    async function doLogin() {
      setLoading(true);
      const { username, password } = form.getValues();
      const response = await login({
        username,
        password,
      });

      if (!response.success) {
        setLoading(false);
        return;
      }

      setUser({
        userID: "", // TODO: populate from response
        username: username,
      });
      setLoading(false);
      form.resetTouched();
    }

    return (
      <Flex justify="center" align="center" h="100%">
        <Form form={form}>
          <Flex
            justify="center"
            align="center"
            h="100%"
            direction="column"
            gap="16"
          >
            {/* TODO: replace with logo */}
            <Title style={{ textAlign: "center" }}>Spotted</Title>
            <Divider />
            <TextInput
              required
              type="text"
              key={form.key("username")}
              label="Username"
              placeholder="GeoSnipe3234"
              {...form.getInputProps("username")}
            />
            <TextInput
              required
              type="password"
              key={form.key("password")}
              label="Password"
              placeholder="******"
              {...form.getInputProps("password")}
            />
            <Flex justify="space-between" w="100%">
              <Button
                type="submit"
                disabled={loading}
                onClick={() => doRegister()}
                variant="light"
              >
                Register
              </Button>
              <Button
                type="submit"
                disabled={loading}
                onClick={() => doLogin()}
                variant="filled"
              >
                Login
              </Button>
            </Flex>
          </Flex>
        </Form>
      </Flex>
    );
  }

  return (
    <>
      {user && showUserInfo()}
      {!user && showLoginForm()}
    </>
  );
}
