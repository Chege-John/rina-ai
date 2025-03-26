// In a new file, e.g., pages/api/test-chatbot.ts
import { onGetCurrentChatBot } from "@/actions/bot";

export default async function handler(req, res) {
  const chatbot = await onGetCurrentChatBot("domain-123");
  res.status(200).json(chatbot);
}
