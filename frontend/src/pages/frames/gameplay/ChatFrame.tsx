import React, { useEffect, useRef, useState } from "react";
import { Button, Flex, ScrollArea, Stack, TextInput, Text } from "@mantine/core";
import { fetchChatMessages, sendChatMessage } from "../../../api/chat-api";
import { useChatStore } from "../../../stores/ChatStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { ChatMessage } from "../../../types/chat/ChatMessage";

export default function ChatFrame() {
  const { user } = useAuthStore();
  const { messages, addMessage, setMessages } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const viewport = useRef<HTMLDivElement>(null);

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
    if (!message.trim()) return;

    const response = await sendChatMessage(message);
    if (response.success && response.data) {
      addMessage(response.data);
      setMessage("");
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        if (viewport.current) {
          viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewport.current && messages.length > 0) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight });
    }
  }, [messages]);

  return (
    <Stack h="100%">
      <strong>Chat</strong>
      <Flex direction="column" h="100%" style={{ overflow: 'hidden' }}>
        <ScrollArea 
          h="300px" 
          viewportRef={viewport} 
          onScrollPositionChange={handleScrollToTop}
          style={{ flex: 1 }}
        >
          <Stack gap="xs">
            {messages.map((msg: ChatMessage) => (
              <div key={msg.id} style={{
                alignSelf: msg.sender.userID === user?.userID ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender.userID === user?.userID ? '#FFD700' : '#f1f1f1',
                padding: '8px 12px',
                borderRadius: '12px',
                maxWidth: '70%',
                marginLeft: msg.sender.userID === user?.userID ? 'auto' : '0',
                marginRight: msg.sender.userID === user?.userID ? '0' : 'auto',
                wordBreak: 'break-word'
              }}>
                <Text size="xs" fw={700}>{msg.sender.username}</Text>
                <Text>{msg.content}</Text>
                <Text size="xs" ta="right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </div>
            ))}
          </Stack>
        </ScrollArea>
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
          <Flex gap="md">
            <TextInput
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="submit" disabled={!message.trim()}>
              Send
            </Button>
          </Flex>
        </form>
      </Flex>
    </Stack>
  );
}
