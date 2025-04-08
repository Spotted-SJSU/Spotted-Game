import React, { useState } from "react";
import { useAuthStore } from "../stores/AuthStore";
import { Button, Divider, Flex, Text, TextInput, Title } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { login, register } from "../api/auth-api";

export default function Login() {
  const { user, setUser, resetUser } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);

  function showUserInfo() {
    return (
      <>
        <Flex>
          <Text>Logged in as {user!.username}!</Text>
          <Button type="reset" onClick={() => resetUser()}>
            Logout
          </Button>
        </Flex>
      </>
    );
  }

  function showLoginForm() {
    const form = useForm({});

    async function doRegister() {
      setLoading(true);
      const { username, password } = form.getValues();
      const response = await register({
        username,
        password,
      });
      console.log(response);
      setLoading(false);
    }

    async function doLogin() {
      setLoading(true);
      const { username, password } = form.getValues();
      const response = await login({
        username,
        password,
      });
      console.log(response);
      setLoading(false);
    }

    return (
      <Flex justify="center" align="center" h="100%">
        <Form form={form}>
          <Flex direction="column" gap="16">
            {/* TODO: replace with logo */}
            <Title style={{ textAlign: "center" }}>Spotted</Title>
            <Divider />
            <TextInput
              required
              type="email"
              key={form.key("email")}
              label="Email address"
              placeholder="email@example.com"
              {...form.getInputProps("email")}
            />
            <TextInput
              required
              type="password"
              key={form.key("password")}
              label="Password"
              placeholder="******"
              {...form.getInputProps("password")}
            />
            <Flex justify="space-between">
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
