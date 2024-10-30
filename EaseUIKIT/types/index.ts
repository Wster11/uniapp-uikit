import type { EasemobChat } from "easemob-websdk/Easemob-chat";

type InputToolbarEvent = {
  onMessageSend: () => void;
  closeToolbar: () => void;
};

type ContactNotice = EasemobChat.ContactMsgBody & {
  ext: "invited" | "agreed" | "refused" | "deleted" | "added";
  time: number;
  showOperation?: boolean;
};

type GroupNotice = EasemobChat.GroupEvent & {
  time: number;
  showOperation?: boolean;
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

type MessageStatus =
  | "sending"
  | "sent"
  | "received"
  | "read"
  | "unread"
  | "failed";

type MixedMessageBody = EasemobChat.ExcludeAckMessageBody & {
  noticeInfo?: MessageNoticeInfo;
  status: MessageStatus;
};

export type {
  InputToolbarEvent,
  ContactNotice,
  GroupNotice,
  ContactNoticeInfo,
  GroupNoticeInfo,
  MixedMessageBody,
  MessageStatus
};
