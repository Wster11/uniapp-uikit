import { makeAutoObservable, runInAction } from "mobx";
import type { MixedMessageBody, Chat } from "../types/index";
import { ChatUIKIT } from "../index";
import { t } from "../locales/index";
import { MessageStatus, ConversationBaseInfo } from "../types/index";
import { chatSDK } from "../sdk";

interface ConversationMessagesInfo {
  messageIds: string[];
  cursor: string;
  isLast: boolean;
  isGetHistoryMessage?: boolean; // 是否获取过历史消息
}
class MessageStore {
  messageMap: Map<string, MixedMessageBody> = new Map();
  conversationMessagesMap: Map<string, ConversationMessagesInfo> = new Map();
  playingAudioMsgId: string = "";
  quoteMessage: MixedMessageBody | null = null; // 当前引用的消息
  editingMessage: Chat.ModifiedMsg | null = null; // 当前编辑的消息

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
    conversation: Chat.ConversationItem,
    cursor?: string,
    onSuccess?: () => void // 调用接口获取成功的回调， msgIds为获取到的消息id列表
  ) {
    try {
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
        const messageIds = dt.messages.map((msg) => msg.id);
        onSuccess?.();
        const info = this.conversationMessagesMap.get(
          conversation.conversationId
        );
        if (info && info.isGetHistoryMessage === true) {
          if (info) {
            const list = [...info.messageIds];
            list.unshift(...messageIds.reverse());
            info.messageIds = list;
            info.cursor = dt.cursor || "";
            info.isLast = dt.isLast;
            info.isGetHistoryMessage = true;
          }
        } else {
          this.conversationMessagesMap.set(conversation.conversationId, {
            messageIds: messageIds.reverse(),
            cursor: dt.cursor || "",
            isLast: dt.isLast,
            isGetHistoryMessage: true
          });
        }
      });
    } catch (error) {
      console.warn("获取漫游消息失败，请检查是否开通漫游消息", error);
      const info = this.conversationMessagesMap.get(
        conversation.conversationId
      );
      runInAction(() => {
        this.conversationMessagesMap.set(conversation.conversationId, {
          messageIds: info?.messageIds || [],
          cursor: "",
          isLast: true
        });
      });
    }
  }

  insertMessage(msg: MixedMessageBody) {
    const convId = ChatUIKIT.convStore.getCvsIdFromMessage(msg);
    runInAction(() => {
      if (this.conversationMessagesMap.has(convId)) {
        const info = this.conversationMessagesMap.get(convId);
        if (info) {
          info.messageIds.push(msg.id);
        }
      } else {
        this.conversationMessagesMap.set(convId, {
          messageIds: [msg.id],
          cursor: "",
          isLast: false
        });
      }
    });
  }

  updateLocalMessage(localMsgId: string, msg: MixedMessageBody) {
    this.messageMap.set(localMsgId, msg);
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

  sendMessage(msg: Chat.MessageBody) {
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
          const convId = ChatUIKIT.convStore.getCvsIdFromMessage(msgCopy);
          const conv = ChatUIKIT.convStore.getConversationById(convId);
          const sentMessage = {
            ...res.message,
            status: "sent"
          } as MixedMessageBody;
          this.updateLocalMessage(msgCopy.id, {
            ...msgCopy,
            ...(res.message as any),
            status: "sent",
            serverMsgId: res.serverMsgId,
            id: msgCopy.id
          });
          // 同时存储服务器消息
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
          console.error("send message failed", error);
          this.updateMessageStatus(msg.id, "failed");
        }
      }
    });
  }

  onMessage(msg: MixedMessageBody) {
    runInAction(() => {
      this.addMessageToMap(msg);
      this.insertMessage(msg);
      ChatUIKIT.convStore.setAtTypeByMessage(msg);
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

  async recallMessage(msg: MixedMessageBody) {
    const mid = msg.serverMsgId || msg.id;
    const res = await ChatUIKIT.getChatConn().recallMessage({
      mid,
      to: ChatUIKIT.convStore.getCvsIdFromMessage(msg),
      chatType: msg.chatType
    });
    runInAction(() => {
      this.onRecallMessage(msg.id, ChatUIKIT.getChatConn().user);
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
            lastMessage = chatSDK.message.create({
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
            lastMessage as Chat.MessageBody,
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

  deleteMessage(cvs: ConversationBaseInfo, msg: MixedMessageBody) {
    const messageId = msg.serverMsgId || msg.id;
    ChatUIKIT.getChatConn()
      .removeHistoryMessages({
        targetId: cvs.conversationId,
        chatType: cvs.conversationType,
        messageIds: [messageId]
      })
      .then(() => {
        runInAction(() => {
          this.removeMessageFromMap(msg.id);
          if (msg.serverMsgId) {
            this.removeMessageFromMap(msg.serverMsgId);
          }
          if (this.conversationMessagesMap.has(cvs.conversationId)) {
            const info = this.conversationMessagesMap.get(cvs.conversationId);
            if (info) {
              const idx = info.messageIds.findIndex((id) => id === msg.id);
              if (idx > -1) {
                info.messageIds.splice(idx, 1);
              }
            }
          }
          const conv = ChatUIKIT.convStore.getConversationById(
            cvs.conversationId
          );
          let lastMessage = conv?.lastMessage;
          if (lastMessage?.id === msg.id) {
            ChatUIKIT.convStore.updateConversationLastMessage(
              {
                conversationId: conv?.conversationId || "",
                conversationType: conv?.conversationType as any
              },
              {} as Chat.MessageBody,
              conv?.unReadCount || 0
            );
          }
        });
      });
  }

  setQuoteMessage(msg: MixedMessageBody | null) {
    this.quoteMessage = msg;
  }

  setEditingMessage(msg: Chat.ModifiedMsg | null) {
    this.editingMessage = msg;
  }

  modifyServerMessage(beforeMsg: MixedMessageBody, msg: Chat.ModifiedMsg) {
    const messageId = beforeMsg.serverMsgId || beforeMsg.id;
    if (!messageId || !msg) {
      throw new Error("modifyServerMessage params error");
    }
    return ChatUIKIT.getChatConn()
      .modifyMessage({
        messageId,
        modifiedMessage: msg
      })
      .then((res) => {
        this.modifyLocalMessage(beforeMsg.id, res.message);
      });
  }

  modifyLocalMessage(messageId: string, msg: Chat.ModifiedMsg) {
    if (this.messageMap.has(messageId)) {
      const oldMsg = this.messageMap.get(messageId);
      //@ts-ignore
      this.messageMap.set(messageId, {
        ...oldMsg,
        ...msg
      });
    }
  }

  /** 检查是不是自己发的消息 */
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
