import { makeAutoObservable, runInAction, set } from "mobx";
import type { MixedMessageBody, ChatSDK } from "../types/index";
import { ChatUIKIT } from "../index";
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
  editingMessage: ChatSDK.ModifiedMsg | null = null; // 当前编辑的消息

  constructor() {
    makeAutoObservable(this);
  }

  addMessageToMap(msg: MixedMessageBody) {
    this.messageMap.set(msg.id, msg);
  }

  removeMessageFromMap(msgId: string) {
    this.messageMap.delete(msgId);
  }

  setPlayingAudioMessageId(msgId: string) {
    this.playingAudioMsgId = msgId;
  }

  async getHistoryMessages(
    conversation: ChatSDK.ConversationItem,
    cursor?: string
  ) {
    const dt = await ChatUIKIT.getChatConn().getHistoryMessages({
      targetId: conversation.conversationId,
      chatType: conversation.conversationType,
      pageSize: 15,
      cursor: cursor || ""
    });

    runInAction(() => {
      dt.messages.forEach((msg: any) => {
        this.addMessageToMap(msg);
      });

      if (this.conversationMessagesMap.has(conversation.conversationId)) {
        const info = this.conversationMessagesMap.get(
          conversation.conversationId
        );
        if (info) {
          const messageIds = dt.messages.map((msg) => msg.id);
          info.messageIds.unshift(...messageIds);
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
    const convId = ChatUIKIT.convStore.getCvsIdFromMessage(msg);
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
    const convId = ChatUIKIT.convStore.getCvsIdFromMessage(msg);
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
      this.addMessageToMap({
        ...msg,
        status,
        id: msgId
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
            this.addMessageToMap({
              ...msg,
              status: "read",
              id
            });
          }
        });
      });
    }
  }

  sendMessage(msg: ChatSDK.MessageBody) {
    runInAction(async () => {
      if (
        msg.type !== "delivery" &&
        msg.type !== "read" &&
        msg.type !== "channel"
      ) {
        try {
          const msgCopy = { ...msg, status: "sending" } as MixedMessageBody;
          this.addMessageToMap(msgCopy);
          this.insertMessage(msgCopy);
          const res = await ChatUIKIT.getChatConn().send(msg);
          // 消息发送成功删除本地的消息
          this.removeMessageFromMap(msgCopy.id);
          const convId = ChatUIKIT.convStore.getCvsIdFromMessage(msgCopy);
          const conv = ChatUIKIT.convStore.getConversationById(convId);
          const sentMessage = {
            ...res.message,
            status: "sent"
          } as MixedMessageBody;
          this.replaceConvMessageId(msgCopy.id, sentMessage);
          res.message &&
            this.addMessageToMap({
              ...sentMessage,
              id: res.serverMsgId
            });

          if (msg.chatType !== "chatRoom") {
            msg.id = res.serverMsgId;
            if (conv) {
              ChatUIKIT.convStore.updateConversationLastMessage(
                {
                  conversationId: convId,
                  conversationType: msg.chatType
                },
                msg,
                conv.unReadCount
              );
              ChatUIKIT.convStore.moveConversationTop(conv);
            } else {
              const newConv = ChatUIKIT.convStore.createConversation(
                {
                  conversationId: convId,
                  conversationType: msg.chatType
                },
                msg,
                0
              );
              ChatUIKIT.convStore.moveConversationTop(newConv);
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
      this.addMessageToMap(msg);
      this.insertMessage(msg);

      if (msg.chatType !== "chatRoom") {
        const convId = ChatUIKIT.convStore.getCvsIdFromMessage(msg);
        const conv = ChatUIKIT.convStore.getConversationById(convId);

        if (conv) {
          ChatUIKIT.convStore.updateConversationLastMessage(
            {
              conversationId: convId,
              conversationType: msg.chatType
            },
            msg,
            msg.from !== ChatUIKIT.getChatConn().user
              ? conv.unReadCount + 1
              : conv.unReadCount
          );
          ChatUIKIT.convStore.moveConversationTop(conv);

          const { currConversation } = ChatUIKIT.convStore;
          if (currConversation?.conversationId === convId) {
            ChatUIKIT.convStore.markConversationRead({
              conversationId: convId,
              conversationType: msg.chatType
            });
          }
        } else {
          const newConv = ChatUIKIT.convStore.createConversation(
            {
              conversationId: convId,
              conversationType: msg.chatType
            },
            msg,
            msg.from !== ChatUIKIT.getChatConn().user ? 1 : 0
          );
          ChatUIKIT.convStore.moveConversationTop(newConv);
        }
      }
    });
  }

  async recallMessage(msg: any) {
    const res = await ChatUIKIT.getChatConn().recallMessage(msg);
    runInAction(() => {
      this.onRecallMessage(msg.mid, ChatUIKIT.getChatConn().user);
    });
    return res;
  }

  onRecallMessage(mid: string, from: string) {
    const recalledMessage = this.messageMap.get(mid);
    if (recalledMessage) {
      const cvsId = ChatUIKIT.convStore.getCvsIdFromMessage(recalledMessage);
      this.addMessageToMap({
        ...recalledMessage,
        noticeInfo: {
          type: "notice",
          noticeType: "recall",
          ext: {
            isRecalled: true,
            from: from
          }
        },
        id: mid
      });

      if (recalledMessage.chatType !== "chatRoom") {
        const conv = ChatUIKIT.convStore.getConversationById(cvsId);
        let lastMessage = conv?.lastMessage;
        const isSelf = from === ChatUIKIT.getChatConn().user;
        if (conv) {
          const unreadCount = conv.unReadCount - 1;
          // 表示撤回的为最后一条消息
          if (lastMessage?.id === mid) {
            lastMessage = ChatUIKIT.connStore.getChatSDK().message.create({
              type: "txt",
              msg: isSelf ? t("selfRecallTip") : t("otherRecallTip"),
              from: from,
              to: recalledMessage.to,
              chatType: recalledMessage.chatType
            });
          }
          ChatUIKIT.convStore.updateConversationLastMessage(
            {
              conversationId: cvsId,
              conversationType: recalledMessage.chatType
            },
            lastMessage as ChatSDK.MessageBody,
            unreadCount < 0 ? 0 : unreadCount
          );
        }
      }
    }
  }

  insertNoticeMessage(msg: MixedMessageBody) {
    const cvsId = ChatUIKIT.convStore.getCvsIdFromMessage(msg);
    runInAction(() => {
      this.addMessageToMap(msg);
      if (this.conversationMessagesMap.has(cvsId)) {
        this.conversationMessagesMap.get(cvsId)?.messageIds.push(msg.id);
      }
    });
  }

  deleteMessage(cvs: ConversationBaseInfo, messageId: string) {
    ChatUIKIT.getChatConn()
      .removeHistoryMessages({
        targetId: cvs.conversationId,
        chatType: cvs.conversationType,
        messageIds: [messageId]
      })
      .then(() => {
        runInAction(() => {
          this.removeMessageFromMap(messageId);
          if (this.conversationMessagesMap.has(cvs.conversationId)) {
            const info = this.conversationMessagesMap.get(cvs.conversationId);
            if (info) {
              const idx = info.messageIds.findIndex((id) => id === messageId);
              if (idx > -1) {
                info.messageIds.splice(idx, 1);
              }
            }
          }
          const conv = ChatUIKIT.convStore.getConversationById(
            cvs.conversationId
          );
          let lastMessage = conv?.lastMessage;
          if (lastMessage?.id === messageId) {
            ChatUIKIT.convStore.updateConversationLastMessage(
              {
                conversationId: conv?.conversationId || "",
                conversationType: conv?.conversationType as any
              },
              {} as ChatSDK.MessageBody,
              conv?.unReadCount || 0
            );
          }
        });
      });
  }

  setQuoteMessage(msg: MixedMessageBody | null) {
    this.quoteMessage = msg;
  }

  setEditingMessage(msg: ChatSDK.ModifiedMsg | null) {
    this.editingMessage = msg;
  }

  modifyServerMessage(messageId: string, msg: ChatSDK.ModifiedMsg) {
    if (!messageId || !msg) {
      throw new Error("modifyServerMessage params error");
    }
    return ChatUIKIT.getChatConn()
      .modifyMessage({
        messageId,
        modifiedMessage: msg
      })
      .then((res) => {
        this.modifyLocalMessage(messageId, res.message);
      });
  }

  modifyLocalMessage(messageId: string, msg: ChatSDK.ModifiedMsg) {
    if (this.messageMap.has(messageId)) {
      const oldMsg = this.messageMap.get(messageId);
      //@ts-ignore
      this.messageMap.set(messageId, {
        ...oldMsg,
        ...msg
      });
    }
  }

  // 检查是不是自己发的消息
  checkMessageFromIsSelf(msg: MixedMessageBody) {
    return msg.from === ChatUIKIT.getChatConn().user || msg.from === "";
  }

  clear() {
    runInAction(() => {
      this.messageMap.clear();
      this.conversationMessagesMap.clear();
    });
  }
}

export default MessageStore;
