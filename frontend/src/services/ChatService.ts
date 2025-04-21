import { ChatMessage } from "../types/chat/ChatMessage";

// Simulated WebSocket implementation - would be replaced with actual WebSocket
class ChatService {
  private static instance: ChatService;
  private callbacks: Array<(message: ChatMessage) => void> = [];
  private mockInterval: NodeJS.Timeout | null = null;

  private constructor() {
    console.log("ChatService initialized");
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public startListening(): void {
    // // For demo purposes, send a system message every 30 seconds
    // this.mockInterval = setInterval(() => {
    //   const mockMessage: ChatMessage = {
    //     id: Math.random().toString(36).substring(7),
    //     content: `Game update: ${new Date().toLocaleTimeString()}`,
    //     sender: {
    //       userID: "system",
    //       username: "System",
    //     },
    //     timestamp: new Date(),
    //   };
      
    //   this.notifyListeners(mockMessage);
    // }, 30000);
  }

  public stopListening(): void {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  public addMessageListener(callback: (message: ChatMessage) => void): void {
    this.callbacks.push(callback);
  }

  public removeMessageListener(callback: (message: ChatMessage) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  private notifyListeners(message: ChatMessage): void {
    this.callbacks.forEach(callback => callback(message));
  }
}

export default ChatService;
