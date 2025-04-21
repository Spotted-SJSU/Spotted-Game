import { User } from "../auth/User";

export interface ChatMessage {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
}
