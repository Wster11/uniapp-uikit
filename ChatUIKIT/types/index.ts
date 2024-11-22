import type { Chat, ChatSDKStatic } from "../sdk";

type InputToolbarEvent = {
  onMessageSend: () => void;
  closeToolbar: () => void;
};

type ConversationBaseInfo = Pick<
  Chat.ConversationItem,
  "conversationId" | "conversationType"
>;

type ConnState = "none" | "reconnecting" | "connected" | "disconnected";

type ContactNotice = Chat.ContactMsgBody & {
  ext: "invited" | "agreed" | "refused" | "deleted" | "added";
  time: number;
};

type GroupNotice = Chat.GroupEvent & {
  time: number;
};

interface ContactNoticeInfo {
  list: ContactNotice[];
  unReadCount: number;
}

interface GroupNoticeInfo {
  list: GroupNotice[];
  unReadCount: number;
}

interface MessageNoticeInfo {
  type: "notice";
  noticeType: "recall" | "group";
  ext: Record<string, any>;
}

interface MessageQuoteExt {
  msgID: string;
  msgPreview: string;
  msgSender: string;
  msgType: string;
}

type MessageStatus =
  | "sending"
  | "sent"
  | "received"
  | "read"
  | "unread"
  | "failed";

type AT_TYPE = "NONE" | "ALL" | "ME";

type MixedMessageBody = Chat.ExcludeAckMessageBody & {
  noticeInfo?: MessageNoticeInfo;
  status?: MessageStatus;
};

type UIKITConversationItem = Chat.ConversationItem & {
  atType?: AT_TYPE;
};

export type {
  InputToolbarEvent,
  ContactNotice,
  ConversationBaseInfo,
  GroupNotice,
  ContactNoticeInfo,
  GroupNoticeInfo,
  MixedMessageBody,
  MessageStatus,
  MessageQuoteExt,
  UIKITConversationItem,
  ConnState,
  AT_TYPE,
  Chat,
  ChatSDKStatic
};
