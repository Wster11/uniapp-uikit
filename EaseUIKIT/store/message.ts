import { makeAutoObservable, runInAction, set } from "mobx";
import type { EasemobChat } from "easemob-websdk/Easemob-chat";
import type { MixedMessageBody } from "../types/index";
import { EaseConnKit } from "../index";
import { t } from "../locales/index";
import { ConversationBaseInfo } from "./types";
import { MessageStatus } from "../types/index";

interface ConversationMessagesInfo {
  messageIds: string[];
  cursor: string;
  isLast: boolean;
}
class MessageStore {
  messageMap: Map<string, MixedMessageBody> = new Map();
  conversationMessagesMap: Map<string, ConversationMessagesInfo> = new Map();
  playingAudioMsgId: string = "";
  quoteMessage: MixedMessageBody | null = null; // 当前引用的消息

  constructor() {
    makeAutoObservable(this);
  }

  setPlayingAudioMessageId(msgId: string) {
    this.playingAudioMsgId = msgId;
  }

  async getHistoryMessages(
    conversation: EasemobChat.ConversationItem,
    cursor?: string
  ) {
    const dt = await EaseConnKit.getChatConn().getHistoryMessages({
      targetId: conversation.conversationId,
      chatType: conversation.conversationType,
      pageSize: 15,
      cursor: cursor || ""
    });

    runInAction(() => {
      dt.messages.forEach((msg: any) => {
        this.messageMap.set(msg.id, msg);
      });

      if (this.conversationMessagesMap.has(conversation.conversationId)) {
        const info = this.conversationMessagesMap.get(
          conversation.conversationId
        );
        if (info) {
          info.messageIds.unshift(
            ...dt.messages
              .map((msg) => {
                return msg.id;
              })
              .reverse()
          );
          info.cursor = dt.cursor || "";
          info.isLast = dt.isLast;
        }
      } else {
        this.conversationMessagesMap.set(conversation.conversationId, {
          messageIds: dt.messages
            .map((msg) => {
              return msg.id;
            })
            .reverse(),
          cursor: dt.cursor || "",
          isLast: dt.isLast
        });
      }
    });
  }

  insertMessage(msg: MixedMessageBody) {
    const convId = EaseConnKit.convStore.getCvsIdFromMessage(msg);
    runInAction(() => {
      if (this.conversationMessagesMap.has(convId)) {
        const info = this.conversationMessagesMap.get(convId);
        if (info) {
          info.messageIds.push(msg.id);
        }
      }
    });
  }

  replaceConvMessageId(localMsgId: string, msg: MixedMessageBody) {
    const convId = EaseConnKit.convStore.getCvsIdFromMessage(msg);
    const idx =
      this.conversationMessagesMap
        .get(convId)
        ?.messageIds.findIndex((id) => id === localMsgId) || -1;

    if (idx > -1) {
      this.conversationMessagesMap
        .get(convId)
        ?.messageIds.splice(idx, 1, msg.id);
    }
  }

  updateMessageStatus(msgId: string, status: MessageStatus) {
    if (this.messageMap.has(msgId)) {
      const msg = this.messageMap.get(msgId) as MixedMessageBody;
      if (msg.status === "read") return;
      this.messageMap.set(msgId, {
        ...msg,
        status
      });
    }
  }

  setAllMessageRead(cvs: ConversationBaseInfo) {
    const info = this.conversationMessagesMap.get(cvs.conversationId);
    if (info) {
      runInAction(() => {
        info.messageIds.forEach((id) => {
          const msg = this.messageMap.get(id);
          if (msg) {
            if (!msg.status || msg.status === "failed") return;
            this.messageMap.set(id, {
              ...msg,
              status: "read"
            });
          }
        });
      });
    }
  }

  sendMessage(msg: EasemobChat.MessageBody) {
    runInAction(async () => {
      if (
        msg.type !== "delivery" &&
        msg.type !== "read" &&
        msg.type !== "channel"
      ) {
        try {
          const msgCopy = { ...msg, status: "sending" } as MixedMessageBody;
          this.messageMap.set(msgCopy.id, msgCopy);
          this.insertMessage(msgCopy);
          const res = await EaseConnKit.getChatConn().send(msg);
          // 消息发送成功删除本地的消息
          this.messageMap.delete(msgCopy.id);
          const convId = EaseConnKit.convStore.getCvsIdFromMessage(msgCopy);
          const conv = EaseConnKit.convStore.getConversationById(convId);
          const sentMessage = {
            ...res.message,
            status: "sent"
          } as MixedMessageBody;
          this.replaceConvMessageId(msgCopy.id, sentMessage);
          res.message && this.messageMap.set(res.serverMsgId, sentMessage);

          if (msg.chatType !== "chatRoom") {
            msg.id = res.serverMsgId;
            if (conv) {
              EaseConnKit.convStore.updateConversationLastMessage(
                {
                  conversationId: convId,
                  conversationType: msg.chatType
                },
                msg,
                conv.unReadCount
              );
              EaseConnKit.convStore.moveConversationTop(conv);
            } else {
              const newConv = EaseConnKit.convStore.createConversation(
                {
                  conversationId: convId,
                  conversationType: msg.chatType
                },
                msg,
                0
              );
              EaseConnKit.convStore.moveConversationTop(newConv);
            }
          }
        } catch (error) {
          this.updateMessageStatus(msg.id, "failed");
        }
      }
    });
  }

  onMessage(msg: MixedMessageBody) {
    runInAction(() => {
      this.messageMap.set(msg.id, msg);
      this.insertMessage(msg);

      if (msg.chatType !== "chatRoom") {
        const convId = EaseConnKit.convStore.getCvsIdFromMessage(msg);
        const conv = EaseConnKit.convStore.getConversationById(convId);

        if (conv) {
          EaseConnKit.convStore.updateConversationLastMessage(
            {
              conversationId: convId,
              conversationType: msg.chatType
            },
            msg,
            msg.from !== EaseConnKit.getChatConn().user
              ? conv.unReadCount + 1
              : conv.unReadCount
          );
          EaseConnKit.convStore.moveConversationTop(conv);

          const { currConversation } = EaseConnKit.convStore;
          if (currConversation?.conversationId === convId) {
            EaseConnKit.convStore.markConversationRead({
              conversationId: convId,
              conversationType: msg.chatType
            });
          }
        } else {
          const newConv = EaseConnKit.convStore.createConversation(
            {
              conversationId: convId,
              conversationType: msg.chatType
            },
            msg,
            msg.from !== EaseConnKit.getChatConn().user ? 1 : 0
          );
          EaseConnKit.convStore.moveConversationTop(newConv);
        }
      }
    });
  }

  async recallMessage(msg: any) {
    const res = await EaseConnKit.getChatConn().recallMessage(msg);
    runInAction(() => {
      this.onRecallMessage(msg.mid, EaseConnKit.getChatConn().user);
    });
    return res;
  }

  onRecallMessage(mid: string, from: string) {
    const recalledMessage = this.messageMap.get(mid);
    if (recalledMessage) {
      const cvsId = EaseConnKit.convStore.getCvsIdFromMessage(recalledMessage);
      this.messageMap.set(mid, {
        ...recalledMessage,
        noticeInfo: {
          type: "notice",
          noticeType: "recall",
          ext: {
            isRecalled: true,
            from: from
          }
        }
      });

      if (recalledMessage.chatType !== "chatRoom") {
        const conv = EaseConnKit.convStore.getConversationById(cvsId);
        let lastMessage = conv?.lastMessage;
        const isSelf = from === EaseConnKit.getChatConn().user;
        if (conv) {
          const unreadCount = conv.unReadCount - 1;
          // 表示撤回的为最后一条消息
          if (lastMessage?.id === mid) {
            lastMessage = EaseConnKit.connStore.getChatSDK().message.create({
              type: "txt",
              msg: isSelf ? t("selfRecallTip") : t("otherRecallTip"),
              from: from,
              to: recalledMessage.to,
              chatType: recalledMessage.chatType
            });
          }
          EaseConnKit.convStore.updateConversationLastMessage(
            {
              conversationId: cvsId,
              conversationType: recalledMessage.chatType
            },
            lastMessage as EasemobChat.MessageBody,
            unreadCount < 0 ? 0 : unreadCount
          );
        }
      }
    }
  }

  insertNoticeMessage(msg: MixedMessageBody) {
    const cvsId = EaseConnKit.convStore.getCvsIdFromMessage(msg);
    runInAction(() => {
      this.messageMap.set(msg.id, msg);
      if (this.conversationMessagesMap.has(cvsId)) {
        this.conversationMessagesMap.get(cvsId)?.messageIds.push(msg.id);
      }
    });
  }

  deleteMessage(cvs: ConversationBaseInfo, messageId: string) {
    EaseConnKit.getChatConn()
      .removeHistoryMessages({
        targetId: cvs.conversationId,
        chatType: cvs.conversationType,
        messageIds: [messageId]
      })
      .then(() => {
        runInAction(() => {
          this.messageMap.delete(messageId);
          if (this.conversationMessagesMap.has(cvs.conversationId)) {
            const info = this.conversationMessagesMap.get(cvs.conversationId);
            if (info) {
              const idx = info.messageIds.findIndex((id) => id === messageId);
              if (idx > -1) {
                info.messageIds.splice(idx, 1);
              }
            }
          }
          const conv = EaseConnKit.convStore.getConversationById(
            cvs.conversationId
          );
          let lastMessage = conv?.lastMessage;
          if (lastMessage?.id === messageId) {
            EaseConnKit.convStore.updateConversationLastMessage(
              {
                conversationId: conv?.conversationId || "",
                conversationType: conv?.conversationType as any
              },
              {} as EasemobChat.MessageBody,
              conv?.unReadCount || 0
            );
          }
        });
      });
  }

  setQuoteMessage(msg: MixedMessageBody | null) {
    this.quoteMessage = msg;
  }

  clear() {
    runInAction(() => {
      this.messageMap.clear();
      this.conversationMessagesMap.clear();
    });
  }
}

export default MessageStore;
