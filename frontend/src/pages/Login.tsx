import React, { useState } from "react";
import { useAuthStore } from "../stores/AuthStore";
import { User } from "../types/auth/User";
import {
  Button,
  ButtonGroup,
  Flex,
  InputLabel,
  Text,
  TextInput,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";

export default function Login() {
  const { user, setUser, resetUser } = useAuthStore();

  if (user) {
    return showUserInfo(user, resetUser);
  } else {
    return showLoginForm(setUser);
  }
}

function showUserInfo(user: User, resetUser: Function) {
  return (
    <>
      <Flex>
        <Text>Logged in as {user.username}!</Text>
        <Button type="reset" onClick={() => resetUser()}>
          Logout
        </Button>
      </Flex>
    </>
  );
}

function showLoginForm(setUser: Function) {
  const form = useForm({});

  return (
    <Flex justify="center" align="center" h="100%">
      <Form form={form}>
        <TextInput
          withAsterisk
          type="email"
          key={form.key("email")}
          label="Email address"
          placeholder="email@example.com"
          {...form.getInputProps("email")}
        />
        <TextInput
          withAsterisk
          type="password"
          key={form.key("password")}
          label="Password"
          placeholder="******"
          {...form.getInputProps("password")}
        />
        <ButtonGroup>
          <Button
            type="submit"
            onClick={() => doRegister(form)}
            variant="light"
          >
            Register
          </Button>
          <Button type="submit" onClick={() => doLogin(form)} variant="default">
            Login
          </Button>
        </ButtonGroup>
      </Form>
    </Flex>
  );
}

async function doRegister(form) {}

async function doLogin(form) {}
