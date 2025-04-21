import { create } from "zustand";
import { ChatMessage } from "../types/chat/ChatMessage";

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set(() => ({ messages })),
}));
