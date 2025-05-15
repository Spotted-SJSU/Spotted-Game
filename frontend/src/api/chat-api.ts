import { ApiResponse } from "../types/api/ApiResponse";
import { ChatMessage } from "../types/chat/ChatMessage";
import { useAuthStore } from "../stores/AuthStore";
import { socket } from "./common";
import { notifications } from "@mantine/notifications";
import { BASE_URL, safeFetch } from "./common";

export async function fetchChatMessages(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<ChatMessage[]>> {
  try {
    // Fetch chat history from the server
    const response = await safeFetch<ChatMessage[]>(`${BASE_URL}/chat-history?limit=${limit}`);

    if (!response.success) {
      notifications.show({
        color: "red",
        title: "Failed to fetch chat history",
        message: "Encountered an error: " + response.error,
      });
      return { success: false, error: response.error, data: [] };
    }

    return response;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return { success: false, error: "Failed to fetch chat history", data: [] };
  }
}

export async function sendChatMessage(
  content: string
): Promise<ApiResponse<ChatMessage>> {
  const user = useAuthStore.getState().user;

  if (!user) {
    return {
      success: false,
      error: "User not authenticated",
      data: undefined
    };
  }

  try {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: {
        id: user.id,
        username: user.username
      },
      timestamp: new Date(),
    };

    socket.emit("chatMessage", newMessage);

    return {
      success: true,
      data: newMessage,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to send message",
      data: undefined
    };
  }
}
