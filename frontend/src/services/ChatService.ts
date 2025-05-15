import { ChatMessage } from "../types/chat/ChatMessage";
import { socket } from "../api/common";
import { useAuthStore } from "../stores/AuthStore";

class ChatService {
  private static instance: ChatService;
  private callbacks: Array<(message: ChatMessage) => void> = [];
  private isListening: boolean = false;

  private constructor() {
    console.log("ChatService initialized");

    // Listen for incoming chat messages from the server
    socket.on("chatMessage", (message: ChatMessage) => {
      this.notifyListeners(message);
    });
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public startListening(): void {
    if (!this.isListening) {
      this.isListening = true;
      console.log("ChatService started listening");
    }
  }

  public stopListening(): void {
    if (this.isListening) {
      this.isListening = false;
      console.log("ChatService stopped listening");
    }
  }

  public sendMessage(content: string): void {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: user,
      timestamp: new Date(),
    };

    // Send to server with full message object
    socket.emit("chatMessage", message);

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
