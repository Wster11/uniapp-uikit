import type { ChatSDK } from "../../types/index";

export type ConversationBaseInfo = Pick<
  ChatSDK.ConversationItem,
  "conversationId" | "conversationType"
>;
