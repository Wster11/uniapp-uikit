import { makeAutoObservable, runInAction } from "mobx";
import type { EasemobChat } from "easemob-websdk/Easemob-chat";
import type { MixedMessageBody } from "../types/index";
import { EaseConnKit } from "../index";

interface ConversationMessagesInfo {
  messages: MixedMessageBody[];
  cursor: string;
  isLast: boolean;
}

class MessageStore {
  messageMap: Map<string, MixedMessageBody> = new Map();
  conversationMessagesMap: Map<string, ConversationMessagesInfo> = new Map();
  playingAudioMsgId: string = "";

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
      pageSize: 50,
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
          info.messages.unshift(...dt.messages.reverse());
          info.cursor = dt.cursor || "";
          info.isLast = dt.isLast;
        }
      } else {
        this.conversationMessagesMap.set(conversation.conversationId, {
          messages: dt.messages.reverse(),
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
          info.messages.push(msg);
        }
      }
    });
  }

  async sendMessage(msg: EasemobChat.MessageBody) {
    const res = await EaseConnKit.getChatConn().send(msg);
    runInAction(() => {
      if (
        msg.type !== "delivery" &&
        msg.type !== "read" &&
        msg.type !== "channel"
      ) {
        res.message && this.messageMap.set(res.serverMsgId, res.message);
        this.insertMessage(res.message as MixedMessageBody);

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
      }
    });

    return res;
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

  async recallMessage(msg: EasemobChat.MessageBody) {
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
      const idx =
        this.conversationMessagesMap
          .get(cvsId)
          ?.messages.findIndex((m) => m.id === mid) || -1;

      if (idx > -1) {
        this.conversationMessagesMap.get(cvsId)?.messages.splice(idx, 1, {
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
      }

      if (recalledMessage.chatType !== "chatRoom") {
        const conv = EaseConnKit.convStore.getConversationById(cvsId);
        if (conv) {
          EaseConnKit.convStore.updateConversationLastMessage(
            {
              conversationId: cvsId,
              conversationType: recalledMessage.chatType
            },
            null as any,
            conv.unReadCount - 1
          );
        }
      }
    }
  }

  insertNoticeMessage(msg: MixedMessageBody) {
    const cvsId = EaseConnKit.convStore.getCvsIdFromMessage(msg);
    runInAction(() => {
      if (this.conversationMessagesMap.has(cvsId)) {
        this.conversationMessagesMap.get(cvsId)?.messages.push(msg);
      }
    });
  }

  clear() {
    runInAction(() => {
      this.messageMap.clear();
      this.conversationMessagesMap.clear();
    });
  }
}

export default MessageStore;
