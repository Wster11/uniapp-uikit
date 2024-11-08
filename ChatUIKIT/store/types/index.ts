import type { Chat } from "../../types/index";

export type ConversationBaseInfo = Pick<
  Chat.ConversationItem,
  "conversationId" | "conversationType"
>;
