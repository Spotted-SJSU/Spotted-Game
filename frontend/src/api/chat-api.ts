import { ApiResponse } from "../types/api/ApiResponse";
import { ChatMessage } from "../types/chat/ChatMessage";
import { useAuthStore } from "../stores/AuthStore";

// Mock chat messages for development
const mockMessages: ChatMessage[] = [
  {
    id: "1",
    content: "Hello everyone!",
    sender: { userID: "user1", username: "Ashwabh" },
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    content: "You guys ready to play?",
    sender: { userID: "user2", username: "Vivek" },
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    content: "I think I see the star icon",
    sender: { userID: "user3", username: "Aniket" },
    timestamp: new Date(Date.now() - 180000),
  },
];

export async function fetchChatMessages(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<ChatMessage[]>> {
  // TODO: Replace with actual API call
  return {
    success: true,
    data: page === 1 ? mockMessages : [],
  };
}

export async function sendChatMessage(
  content: string
): Promise<ApiResponse<ChatMessage>> {
  const user = useAuthStore.getState().user;
  
//   if (!user) {
//     return {
//       success: false,
//       error: "User not authenticated",
//     };
//   }

  // TODO: Replace with actual API call
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    content,
    sender: {
  userID: "fewf",
  username: "Aditya",
}
,
    timestamp: new Date(),
  };

  return {
    success: true,
    data: newMessage,
  };
}
