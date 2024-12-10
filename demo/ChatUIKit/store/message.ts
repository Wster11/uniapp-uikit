/**
 * 消息管理类
 * 负责管理消息的存储、发送、接收、撤回、删除等功能
 */
import { makeAutoObservable, runInAction } from "mobx";
import type { MixedMessageBody, Chat } from "../types/index";
import { ChatUIKit } from "../index";
import { t } from "../locales/index";
import { MessageStatus, ConversationBaseInfo } from "../types/index";
import { MAX_MESSAGES_PER_CONVERSATION } from "../const";
import { chatSDK } from "../sdk";
import { logger } from "../log";

/**
 * 会话消息信息接口
 */
interface ConversationMessagesInfo {
  messageIds: string[]; // 消息ID列表
  cursor: string; // 分页游标
  isLast: boolean; // 是否为最后一页
  isGetHistoryMessage?: boolean; // 是否获取过历史消息
}

// 获取历史消息的PAGE_SIZE
const PAGE_SIZE = 15;

/**
 * 消息存储类
 */
class MessageStore {
  // 存储所有消息的映射表，key 为消息 ID，value 为消息内容，对于本地发送的消息 key为本地消息ID，对于服务器消息 key为服务器消息ID
  messageMap: Map<string, MixedMessageBody> = new Map();

  // 存储会话消息信息的映射表，key 为会话 ID，value 为该会话的消息信息
  conversationMessagesMap: Map<string, ConversationMessagesInfo> = new Map();

  // 当前正在播放的语音消息 ID
  playingAudioMsgId: string = "";

  // 当前被引用（回复）的消息对象
  quoteMessage: MixedMessageBody | null = null;

  // 当前正在编辑的消息对象
  editingMessage: Chat.ModifiedMsg | null = null;

  /**
   * 构造函数
   * 初始化并使对象可观察
   */
  constructor() {
    makeAutoObservable(this);
  }

  /**
   * 将消息添加到消息映射中
   * @param msg 要添加的消息对象
   */
  addMessageToMap(msg: MixedMessageBody) {
    this.messageMap.set(msg.id, msg);
  }

  /**
   * 从消息映射中移除指定消息
   * @param msgId 要移除的消息ID
   */
  removeMessageFromMap(msgId: string) {
    this.messageMap.delete(msgId);
  }

  /**
   * 设置当前正在播放的音频消息ID
   * @param msgId 音频消息ID
   */
  setPlayingAudioMessageId(msgId: string) {
    this.playingAudioMsgId = msgId;
  }

  /**
   * 获取历史消息
   * @param conversation 会话对象
   * @param cursor 分页游标
   * @param onSuccess 获取成功的回调函数
   */
  async getHistoryMessages(
    conversation: Chat.ConversationItem,
    cursor?: string,
    onSuccess?: () => void
  ) {
    try {
      const dt = await ChatUIKit.getChatConn().getHistoryMessages({
        targetId: conversation.conversationId,
        chatType: conversation.conversationType,
        pageSize: PAGE_SIZE,
        cursor: cursor || ""
      });

      logger.info("[MessageStore] Get history messages success", dt);

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
      logger.error("[MessageStore] Get history messages failed", error);
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

  /**
   * 插入新消息
   * @param msg 要插入的消息对象
   */
  insertMessage(msg: MixedMessageBody) {
    const convId = ChatUIKit.convStore.getCvsIdFromMessage(msg);
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

  /**
   * 更新本地消息
   * @param localMsgId 本地消息ID
   * @param msg 更新后的消息对象
   */
  updateLocalMessage(localMsgId: string, msg: MixedMessageBody) {
    this.messageMap.set(localMsgId, msg);
  }

  /**
   * 更新消息状态
   * @param msgId 消息ID
   * @param status 新的消息状态
   */
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

  /**
   * 将会话中的所有消息标记为已读
   * @param cvs 会话基本信息
   */
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

  /**
   * 发送消息
   * @param msg 要发送的消息对象
   * @param uploadFileFunc 如果存在附件消息上传方法， 则等待上传文件的函数成功，在发送消息
   */
  sendMessage(msg: Chat.MessageBody, uploadFileFunc?: () => Promise<any>) {
    runInAction(async () => {
      if (
        msg.type !== "delivery" &&
        msg.type !== "read" &&
        msg.type !== "channel"
      ) {
        try {
          let msgCopy = { ...msg, status: "sending" } as MixedMessageBody;
          // 同步本地消息和服务器消息的格式
          if (msgCopy.type === "audio") {
            //@ts-ignore
            msgCopy.length = msgCopy.body.length;
            //@ts-ignore
            msgCopy.url = msgCopy.body.url;
          }
          // 同步本地消息和服务器消息的格式
          if (msgCopy.type === "file") {
            //@ts-ignore
            msgCopy.file_length = msgCopy.body.file_length;
            //@ts-ignore
            msgCopy.url = msgCopy.body.url;
            //@ts-ignore
            msgCopy.filename = msgCopy.body.filename;
          }
          if (msgCopy.type === "video") {
            //@ts-ignore
            msgCopy.url = msgCopy.body.url;
          }
          if (msgCopy.type === "img") {
            //@ts-ignore
            msgCopy.thumb = msgCopy.url;
          }
          this.addMessageToMap(msgCopy);
          this.insertMessage(msgCopy);
          if (uploadFileFunc) {
            logger.info("[MessageStore] Upload file start");
            let res = await uploadFileFunc();
            logger.info("[MessageStore] Upload file success");
            const data = JSON.parse(res.data);
            if (msg.type === "img") {
              //@ts-ignore
              msg.url = data.uri + "/" + data.entities[0].uuid;
            }
            if (
              msg.type === "audio" ||
              msg.type === "file" ||
              msg.type === "video"
            ) {
              //@ts-ignore
              msg.body.url = data.uri + "/" + data.entities[0].uuid;
            }
          }
          const res = await ChatUIKit.getChatConn().send(msg);
          logger.info("[MessageStore] Send message success", res);

          const convId = ChatUIKit.convStore.getCvsIdFromMessage(msgCopy);
          const conv = ChatUIKit.convStore.getConversationById(convId);
          const sentMessage = {
            ...res.message,
            status: "sent"
          } as MixedMessageBody;

          let newLocalMsg = {
            ...msgCopy,
            ...(res.message as any),
            status: "sent",
            serverMsgId: res.serverMsgId,
            id: msgCopy.id
          };

          if (msg.type === "video") {
            // 设置视频缩略图
            newLocalMsg.thumb = (res.message as Chat.VideoMsgBody).thumb;
            // 设置视频url为本地路径
            newLocalMsg.url = (msgCopy as Chat.VideoMsgBody).url;
          }

          if (msg.type === "img") {
            // 设置图片消息为本地消息路径
            newLocalMsg.thumb = (msgCopy as Chat.ImgMsgBody).thumb;
            newLocalMsg.url = (msgCopy as Chat.ImgMsgBody).url;
          }

          this.updateLocalMessage(msgCopy.id, newLocalMsg);
          // 同时存储服务器消息
          res.message &&
            this.addMessageToMap({
              ...sentMessage,
              id: res.serverMsgId
            });

          if (msg.chatType !== "chatRoom") {
            if (conv) {
              ChatUIKit.convStore.updateConversationLastMessage(
                {
                  conversationId: convId,
                  conversationType: msg.chatType
                },
                msg,
                conv.unReadCount
              );
              ChatUIKit.convStore.moveConversationTop(conv);
            } else {
              const newConv = ChatUIKit.convStore.createConversation(
                {
                  conversationId: convId,
                  conversationType: msg.chatType
                },
                msg,
                0
              );
              ChatUIKit.convStore.moveConversationTop(newConv);
            }
          }
        } catch (error) {
          logger.error("[MessageStore] Send message failed", error);
          this.updateMessageStatus(msg.id, "failed");
        }
      }
    });
  }

  /**
   * 处理接收到的消息
   * @param msg 接收到的消息对象
   */
  onMessage(msg: MixedMessageBody) {
    runInAction(() => {
      this.addMessageToMap(msg);
      this.insertMessage(msg);
      ChatUIKit.convStore.setAtTypeByMessage(msg);
      if (msg.chatType !== "chatRoom") {
        const convId = ChatUIKit.convStore.getCvsIdFromMessage(msg);
        const conv = ChatUIKit.convStore.getConversationById(convId);

        if (conv) {
          ChatUIKit.convStore.updateConversationLastMessage(
            {
              conversationId: convId,
              conversationType: msg.chatType
            },
            msg,
            msg.from !== ChatUIKit.getChatConn().user
              ? conv.unReadCount + 1
              : conv.unReadCount
          );
          ChatUIKit.convStore.moveConversationTop(conv);

          const { currConversation } = ChatUIKit.convStore;
          if (currConversation?.conversationId === convId) {
            ChatUIKit.convStore.markConversationRead({
              conversationId: convId,
              conversationType: msg.chatType
            });
          }
        } else {
          const newConv = ChatUIKit.convStore.createConversation(
            {
              conversationId: convId,
              conversationType: msg.chatType
            },
            msg,
            msg.from !== ChatUIKit.getChatConn().user ? 1 : 0
          );
          ChatUIKit.convStore.moveConversationTop(newConv);
        }
        // 如果当前会话不是正在查看的会话，则清理超过限制的消息
        if (ChatUIKit.convStore.currConversation?.conversationId !== convId) {
          this.cleanupRemovedMessages(convId);
        }
      }
    });
  }

  /**
   * 撤回消息
   * @param msg 要撤回的消息对象
   * @returns 撤回操作的结果
   */
  async recallMessage(msg: MixedMessageBody) {
    try {
      const mid = msg.serverMsgId || msg.id;
      const res = await ChatUIKit.getChatConn().recallMessage({
        mid,
        to: ChatUIKit.convStore.getCvsIdFromMessage(msg),
        chatType: msg.chatType
      });
      logger.info("[MessageStore] Recall message success", res);
      runInAction(() => {
        this.onRecallMessage(msg.id, ChatUIKit.getChatConn().user);
      });
      return res;
    } catch (error) {
      logger.error("[MessageStore] Recall message failed", error);
      throw error;
    }
  }

  /**
   * 处理消息撤回事件
   * @param mid 消息ID
   * @param from 撤回消息的用户ID
   */
  onRecallMessage(mid: string, from: string) {
    const recalledMessage = this.messageMap.get(mid);
    if (recalledMessage) {
      const cvsId = ChatUIKit.convStore.getCvsIdFromMessage(recalledMessage);
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
        const conv = ChatUIKit.convStore.getConversationById(cvsId);
        let lastMessage = conv?.lastMessage;
        const isSelf = from === ChatUIKit.getChatConn().user;
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
            //@ts-ignore
            lastMessage.noticeInfo = {
              type: "notice",
              noticeType: "recall",
              ext: {
                isRecalled: true,
                from: from
              }
            };
          }
          ChatUIKit.convStore.updateConversationLastMessage(
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

  /**
   * 插入通知类消息
   * @param msg 通知消息对象
   */
  insertNoticeMessage(msg: MixedMessageBody) {
    const cvsId = ChatUIKit.convStore.getCvsIdFromMessage(msg);
    runInAction(() => {
      this.addMessageToMap(msg);
      if (this.conversationMessagesMap.has(cvsId)) {
        this.conversationMessagesMap.get(cvsId)?.messageIds.push(msg.id);
      }
    });
  }

  /**
   * 删除消息
   * @param cvs 会话基本信息
   * @param msg 要删除的消息对象
   */
  deleteMessage(cvs: ConversationBaseInfo, msg: MixedMessageBody) {
    const messageId = msg.serverMsgId || msg.id;
    ChatUIKit.getChatConn()
      .removeHistoryMessages({
        targetId: cvs.conversationId,
        chatType: cvs.conversationType,
        messageIds: [messageId]
      })
      .then(() => {
        logger.info("[MessageStore] Delete message success", messageId);
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
          const conv = ChatUIKit.convStore.getConversationById(
            cvs.conversationId
          );
          let lastMessage = conv?.lastMessage;
          if (lastMessage?.id === msg.id) {
            ChatUIKit.convStore.updateConversationLastMessage(
              {
                conversationId: conv?.conversationId || "",
                conversationType: conv?.conversationType as any
              },
              {} as Chat.MessageBody,
              conv?.unReadCount || 0
            );
          }
        });
      })
      .catch((error) => {
        logger.error("[MessageStore] Delete message failed", error);
      });
  }

  /**
   * 设置引用消息
   * @param msg 要引用的消息对象或null
   */
  setQuoteMessage(msg: MixedMessageBody | null) {
    this.quoteMessage = msg;
  }

  /**
   * 设置正在编辑的消息
   * @param msg 要编辑的消息对象或null
   */
  setEditingMessage(msg: Chat.ModifiedMsg | null) {
    this.editingMessage = msg;
  }

  /**
   * 修改服务器上的消息
   * @param beforeMsg 修改前的消息对象
   * @param msg 修改后的消息对象
   * @returns Promise
   */
  modifyServerMessage(beforeMsg: MixedMessageBody, msg: Chat.ModifiedMsg) {
    const messageId = beforeMsg.serverMsgId || beforeMsg.id;
    if (!messageId || !msg) {
      throw new Error("modifyServerMessage params error");
    }
    return ChatUIKit.getChatConn()
      .modifyMessage({
        messageId,
        modifiedMessage: msg
      })
      .then((res) => {
        logger.info("[MessageStore] Modify message success", res);
        this.modifyLocalMessage(beforeMsg.id, res.message);
      })
      .catch((error) => {
        logger.error("[MessageStore] Modify message failed", error);
        throw error;
      });
  }

  /**
   * 修改本地消息
   * @param messageId 消息ID
   * @param msg 修改后的消息对象
   */
  modifyLocalMessage(messageId: string, msg: Chat.ModifiedMsg) {
    if (this.messageMap.has(messageId)) {
      const oldMsg = this.messageMap.get(messageId);
      const convId = ChatUIKit.convStore.getCvsIdFromMessage(msg);
      this.updateLocalMessage(messageId, {
        ...oldMsg,
        ...msg,
        id: oldMsg!.id
      });

      const conv = ChatUIKit.convStore.getConversationById(convId);
      let lastMessage = conv?.lastMessage;

      if (lastMessage?.id === oldMsg!.id) {
        ChatUIKit.convStore.updateConversationLastMessage(
          {
            conversationId: conv?.conversationId || "",
            conversationType: conv?.conversationType as any
          },
          {
            ...oldMsg,
            ...msg,
            id: oldMsg?.id
          } as Chat.MessageBody,
          conv?.unReadCount || 0
        );
      }
    }
  }

  /**
   * 检查消息是否是自己发送的
   * @param msg 消息对象
   * @returns boolean 是否是自己发送的消息
   */
  checkMessageFromIsSelf(msg: MixedMessageBody) {
    return msg.from === ChatUIKit.getChatConn().user || msg.from === "";
  }

  /**
   * 清理指定会话中超过限制的消息（目前在离开会话页面和收到消息时会调用）
   * @param conversationId 会话ID
   */
  cleanupRemovedMessages(conversationId: string) {
    const info = this.conversationMessagesMap.get(conversationId);
    if (!info || info.messageIds.length <= MAX_MESSAGES_PER_CONVERSATION) {
      return;
    }

    runInAction(() => {
      // 计算需要移除的消息数量
      const removeCount =
        info.messageIds.length - MAX_MESSAGES_PER_CONVERSATION;

      // 获取要移除的消息ID（最早的消息）
      const messageIdsToRemove = info.messageIds.slice(0, removeCount);

      // 更新会话的消息ID列表，只保留最新的 MAX_MESSAGES_PER_CONVERSATION 条
      info.messageIds = info.messageIds.slice(removeCount);

      info.cursor = info.messageIds[0];

      info.isLast = false;

      // 清理被移除的消息
      messageIdsToRemove.forEach((msgId) => {
        const msg = this.messageMap.get(msgId);
        if (!msg) return;
        // 清理消息映射
        this.removeMessageFromMap(msgId);

        // 清理服务器消息ID映射
        if (msg.serverMsgId && msg.serverMsgId !== msgId) {
          this.removeMessageFromMap(msg.serverMsgId);
        }
      });

      logger.info(
        `[MessageStore] Cleaned up ${messageIdsToRemove.length} messages from conversation ${conversationId}`
      );
    });
  }

  /**
   * 清空所有消息数据
   */
  clear() {
    runInAction(() => {
      this.messageMap.clear();
      this.conversationMessagesMap.clear();
    });
  }
}

export default MessageStore;
