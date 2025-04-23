import { useEffect } from "react";
import ChatService from "../services/ChatService";
import { ChatMessage } from "../types/chat/ChatMessage";
import { useChatStore } from "../stores/ChatStore";

export function useChatService() {
  const { addMessage } = useChatStore();
  
  useEffect(() => {
    const chatService = ChatService.getInstance();
    
    const handleNewMessage = (message: ChatMessage) => {
      addMessage(message);
    };
    
    chatService.addMessageListener(handleNewMessage);
    chatService.startListening();
    
    return () => {
      chatService.removeMessageListener(handleNewMessage);
      chatService.stopListening();
    };
  }, [addMessage]);
}
