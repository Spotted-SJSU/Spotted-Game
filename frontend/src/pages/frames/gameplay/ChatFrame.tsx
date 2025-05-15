import React, { useEffect, useRef, useState } from "react";
import { Button, Flex, ScrollArea, Stack, TextInput, Text, Card, Title, Paper, Box, Loader } from "@mantine/core";
import { fetchChatMessages, sendChatMessage } from "../../../api/chat-api";
import { useChatStore } from "../../../stores/ChatStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { ChatMessage } from "../../../types/chat/ChatMessage";
import ChatService from "../../../services/ChatService";
import { IconSend } from '@tabler/icons-react';

export default function ChatFrame() {
  const { user } = useAuthStore();
  const { messages, addMessage, setMessages } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const viewport = useRef<HTMLDivElement>(null);
  const chatService = ChatService.getInstance();

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, []);

  // Function to load chat messages
  const loadMessages = async (pageToLoad = 1) => {
    if (loading || (pageToLoad > 1 && !hasMore)) return;

    setLoading(true);
    const response = await fetchChatMessages(pageToLoad);
    setLoading(false);

    if (response.success && response.data) {
      if (pageToLoad === 1) {
        setMessages(response.data);
      } else {
        setMessages([...response.data, ...messages]);
      }

      if (response.data.length === 0) {
        setHasMore(false);
      }
    }
  };

  // Handle scroll to load more messages
  const handleScrollToTop = () => {
    if (viewport.current && viewport.current.scrollTop < 50 && !loading && hasMore) {
      setPage(prev => prev + 1);
      loadMessages(page + 1);
    }
  };

  // Handle new message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      // Use the ChatService to send the message via WebSocket
      chatService.sendMessage(message);
      setMessage("");

      // Scroll to bottom after sending message
      setTimeout(() => {
        if (viewport.current) {
          viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewport.current && messages.length > 0) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight });
    }
  }, [messages]);

  return (
    <Card shadow="sm" padding="0" radius="md" withBorder style={{ height: "100%", width: "100%" }}>
      <Card.Section withBorder inheritPadding py="xs" px="md" bg="rgba(255, 215, 0, 0.1)">
        <Title order={4} style={{ padding: '5px 10px' }}>Chat</Title>
      </Card.Section>

      <Flex direction="column" h="calc(100% - 52px)" style={{ position: 'relative' }}>
        {loading && page > 1 && (
          <Box style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
            <Loader size="sm" />
          </Box>
        )}

        <ScrollArea
          h="100%"
          viewportRef={viewport}
          onScrollPositionChange={handleScrollToTop}
          style={{ flex: 1 }}
          p="md"
        >
          <Stack gap="md" py="xs" px="xs">
            {messages.map((msg: ChatMessage) => (
              <div key={msg.id} style={{
                alignSelf: msg.sender.id === user?.id ? 'flex-end' : 'flex-start',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '90%',
                marginLeft: msg.sender.id === user?.id ? 'auto' : '0',
                marginRight: msg.sender.id === user?.id ? '0' : 'auto',
              }}>
                <Paper
                  shadow="xs"
                  radius="lg"
                  p="xs"
                  withBorder
                  style={{
                    backgroundColor: msg.sender.id === user?.id ? '#FFD700' : '#f8f9fa',
                    borderTopRightRadius: msg.sender.id === user?.id ? 0 : undefined,
                    borderTopLeftRadius: msg.sender.id === user?.id ? undefined : 0,
                    wordBreak: 'break-word',
                    minWidth: '100px',
                    padding: '8px 12px'
                  }}
                >
                  <Text size="xs" fw={700} c={msg.sender.id === user?.id ? "rgba(0,0,0,0.8)" : "blue.7"}>
                    {msg.sender.username}
                  </Text>
                  <Text mt={4}>{msg.content}</Text>
                  <Text size="xs" ta="right" c="dimmed" mt={2}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Paper>
              </div>
            ))}
          </Stack>
        </ScrollArea>

        <Box px="md" pb="md" pt="xs" style={{ borderTop: '1px solid #eee' }}>
          <form onSubmit={handleSubmit}>
            <Flex gap="md" align="center">
              <TextInput
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ flex: 1 }}
                radius="xl"
                size="md"
                autoComplete="off"
              />
              <Button
                type="submit"
                disabled={!message.trim()}
                radius="xl"
                size="md"
                color="yellow"
                variant="filled"
                style={{ minWidth: '60px' }}
              >
                <IconSend size={20} />
              </Button>
            </Flex>
          </form>
        </Box>
      </Flex>
    </Card>
  );
}
