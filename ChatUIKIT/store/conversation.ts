import { makeAutoObservable, runInAction } from "mobx";
import { getTimeStringAutoShort, sortByPinned } from "../utils/index";
import type { ConversationBaseInfo } from "../types/index";
import type {
  MixedMessageBody,
  Chat,
  UIKITConversationItem,
  AT_TYPE
} from "../types/index";
import { AT_ALL } from "../const/index";
import { ChatUIKIT } from "../index";
import { chatSDK } from "../sdk";

/**
 * 会话管理类
 * 负责管理会话列表、当前会话、免打扰状态等功能
 */
class ConversationStore {
  /** 会话列表 */
  conversationList: UIKITConversationItem[] = [];
  /** 当前选中的会话 */
  currConversation: ConversationBaseInfo | null = null;
  /** 会话免打扰状态映射表 */
  muteConvsMap: Map<string, boolean> = new Map();
  /** 获取会话列表的分页参数 */
  conversationParams: { pageSize: number; cursor: string } = {
    pageSize: 20,
    cursor: ""
  };
  /** 获取置顶会话的分页参数 */
  pinConversationParams: { pageSize: number; cursor: string } = {
    pageSize: 20,
    cursor: ""
  };

  /** 递归获取用户信息的方法引用 */
  deepGetUserInfo = ChatUIKIT.contactStore.deepGetUserInfo;

  /**
   * 构造函数
   * 初始化并使对象可观察
   */
  constructor() {
    console.log("[ConversationStore] Initializing...");
    makeAutoObservable(this);
  }

  /**
   * 获取未读消息总数
   * 计算所有非免打扰会话的未读数之和
   */
  get totalUnreadCount() {
    const count = this.conversationList.reduce((prev, curr) => {
      const isMuted = this.muteConvsMap.get(curr.conversationId);
      return prev + (isMuted ? 0 : curr.unReadCount);
    }, 0);
    console.log("[ConversationStore] Total unread count:", count);
    return count;
  }

  /**
   * 设置会话列表
   * @param conversations 会话数组
   */
  setConversations(conversations: Chat.ConversationItem[]) {
    console.log("[ConversationStore] Setting conversations:", conversations);
    if (!Array.isArray(conversations)) {
      return console.error("[ConversationStore] Invalid parameter: conversations");
    }

    const currentCvsId = this.conversationList.map(
      (item) => item.conversationId
    );
    const filteredConversations = conversations.filter(
      ({ conversationId }) => !currentCvsId.includes(conversationId)
    );
    const beforeConversations = [...this.conversationList];
    const userIds = filteredConversations
      .filter(
        (conversationItem) => conversationItem.conversationType === "singleChat"
      )
      .map((conversationItem) => conversationItem.conversationId);

    console.log("[ConversationStore] Getting user info for:", userIds);
    this.deepGetUserInfo(userIds);
    this.getSilentModeForConversations(filteredConversations);

    beforeConversations.push(...filteredConversations);

    this.conversationList = [...beforeConversations.sort(sortByPinned)];
    console.log("[ConversationStore] Updated conversation list:", this.conversationList);
  }

  /**
   * 获取服务器会话列表
   * 递归获取所有会话
   */
  async getConversationList() {
    console.log("[ConversationStore] Getting conversation list with params:", this.conversationParams);
    const res = await ChatUIKIT.getChatConn().getServerConversations(
      this.conversationParams
    );
    this.setConversations(res.data?.conversations || []);
    this.conversationParams.cursor = res.data?.cursor || "";
    if (res.data?.cursor) {
      console.log("[ConversationStore] More conversations available, fetching next page");
      await this.getConversationList();
    }
    return res;
  }

  /**
   * 获取服务器置顶会话列表
   * 递归获取所有置顶会话
   */
  async getServerPinnedConversations() {
    console.log("[ConversationStore] Getting pinned conversations with params:", this.pinConversationParams);
    const res = await ChatUIKIT.getChatConn().getServerPinnedConversations(
      this.pinConversationParams
    );
    this.setConversations(res.data?.conversations || []);
    this.pinConversationParams.cursor = res.data?.cursor || "";
    if (res.data?.cursor) {
      console.log("[ConversationStore] More pinned conversations available, fetching next page");
      await this.getServerPinnedConversations();
    } else {
      console.log("[ConversationStore] No more pinned conversations, getting regular conversations");
      this.getConversationList();
    }
    return res;
  }

  /**
   * 从store中删除会话
   * @param conversation 要删除的会话
   */
  deleteStoreConversation(conversation: Chat.ConversationItem) {
    console.log("[ConversationStore] Deleting conversation from store:", conversation);
    const idx = this.conversationList.findIndex(
      (cvs) =>
        cvs.conversationType === conversation.conversationType &&
        cvs.conversationId === conversation.conversationId
    );
    if (idx > -1) {
      this.conversationList.splice(idx, 1);
      console.log("[ConversationStore] Successfully deleted conversation");
    } else {
      console.log("[ConversationStore] Conversation not found in store");
    }
  }

  /**
   * 删除会话
   * @param conversation 要删除的会话
   * @param deleteMessage 是否同时删除消息
   */
  async deleteConversation(
    conversation: Chat.ConversationItem,
    deleteMessage = false
  ) {
    console.log("[ConversationStore] Deleting conversation:", conversation, "deleteMessage:", deleteMessage);
    if (typeof conversation !== "object") {
      return console.error("[ConversationStore] Invalid parameter: conversation");
    }
    await ChatUIKIT.getChatConn().deleteConversation({
      channel: conversation.conversationId,
      chatType: conversation.conversationType,
      deleteRoam: deleteMessage
    });
    this.deleteStoreConversation(conversation);
  }

  /**
   * 根据会话ID获取会话
   * @param conversationId 会话ID
   */
  getConversationById(conversationId: string) {
    console.log("[ConversationStore] Getting conversation by id:", conversationId);
    const conversation = this.conversationList.find(
      (item) => item.conversationId === conversationId
    );
    console.log("[ConversationStore] Found conversation:", conversation);
    return conversation;
  }

  /**
   * 获取会话时间显示字符串
   * @param message 会话最后一条消息
   */
  getConversationTime(message: Chat.ConversationItem["lastMessage"]) {
    if (!message || !message.time) {
      return "";
    }
    return getTimeStringAutoShort(message.time, true);
  }

  /**
   * 清除会话未读数
   * @param conversationId 会话ID
   */
  clearConversationUnreadCount(conversationId: string) {
    console.log("[ConversationStore] Clearing unread count for conversation:", conversationId);
    const conv = this.getConversationById(conversationId);
    if (conv) {
      conv.unReadCount = 0;
      console.log("[ConversationStore] Successfully cleared unread count");
    }
  }

  /**
   * 标记会话已读
   * @param conversation 会话信息
   */
  async markConversationRead(conversation: ConversationBaseInfo) {
    console.log("[ConversationStore] Marking conversation as read:", conversation);
    const msg = chatSDK.message.create({
      type: "channel",
      chatType: conversation.conversationType,
      to: conversation.conversationId
    });
    await ChatUIKIT.getChatConn().send(msg);
    this.setAtType(
      conversation.conversationType,
      conversation.conversationId,
      "NONE"
    );
    this.clearConversationUnreadCount(conversation.conversationId);
  }

  /**
   * 设置当前会话
   * @param conversation 会话信息
   */
  setCurrentConversation(conversation: ConversationBaseInfo | null) {
    console.log("[ConversationStore] Setting current conversation:", conversation);
    this.currConversation = conversation;
  }

  /**
   * 将会话置顶
   * @param conversation 要置顶的会话
   */
  moveConversationTop(conversation: Chat.ConversationItem) {
    console.log("[ConversationStore] Moving conversation to top:", conversation);
    const conv = this.getConversationById(conversation.conversationId);
    const conversationList = [...this.conversationList];
    if (conv) {
      const idx = this.conversationList.findIndex(
        (item) => item.conversationId === conversation.conversationId
      );
      if (idx > -1) {
        runInAction(() => {
          conversationList.splice(idx, 1);
          conversationList.unshift(conversation);
        });
      }
    } else {
      conversationList.unshift(conversation);
    }
    this.conversationList = [...conversationList.sort(sortByPinned)];
    console.log("[ConversationStore] Updated conversation list after moving to top");
  }

  /**
   * 创建新会话
   * @param conversation 会话基本信息
   * @param msg 消息内容
   * @param unReadCount 未读数
   */
  createConversation(
    conversation: ConversationBaseInfo,
    msg: Chat.MessageBody,
    unReadCount = 0
  ) {
    console.log("[ConversationStore] Creating new conversation:", conversation);
    const conv: Chat.ConversationItem = {
      conversationId: conversation.conversationId,
      conversationType: conversation.conversationType,
      lastMessage: msg,
      unReadCount,
      isPinned: false,
      pinnedTime: 0
    };
    if (conversation.conversationType === "singleChat") {
      this.deepGetUserInfo([conversation.conversationId]);
    }
    console.log("[ConversationStore] Created conversation:", conv);
    return conv;
  }

  /**
   * 更新会话最后一条消息
   * @param conversation 会话信息
   * @param msg 最新消息
   * @param unReadCount 未读数
   */
  updateConversationLastMessage(
    conversation: ConversationBaseInfo,
    msg: Chat.MessageBody,
    unReadCount = 0
  ) {
    console.log("[ConversationStore] Updating last message for conversation:", conversation);
    const conv = this.getConversationById(conversation.conversationId);
    if (conv) {
      runInAction(() => {
        conv.lastMessage = msg;
        conv.unReadCount = unReadCount;
      });
      console.log("[ConversationStore] Successfully updated last message");
    }
  }

  /**
   * 从消息中获取会话ID
   * @param message 消息对象
   */
  getCvsIdFromMessage(message: MixedMessageBody) {
    let conversationId;
    if (message.chatType === "groupChat" || message.chatType === "chatRoom") {
      conversationId = message.to;
    } else if (
      message.from === ChatUIKIT.getChatConn().user ||
      message.from === ""
    ) {
      conversationId = message.to;
    } else {
      conversationId = message.from || "";
    }
    console.log("[ConversationStore] Got conversation ID from message:", conversationId);
    return conversationId;
  }

  /**
   * 获取会话的免打扰状态
   * @param conversationList 会话列表
   */
  getSilentModeForConversations(conversationList: Chat.ConversationItem[]) {
    console.log("[ConversationStore] Getting silent mode for conversations:", conversationList);
    if (!conversationList || conversationList.length == 0) {
      return;
    }
    const params = {
      conversationList: conversationList.map((item) => {
        return {
          id: item.conversationId,
          type: item.conversationType
        };
      })
    };
    ChatUIKIT.getChatConn()
      .getSilentModeForConversations(params)
      .then((res) => {
        const userSetting = res.data?.user || [];
        const groupSetting = res.data?.group || [];

        Object.keys(userSetting).forEach((userId) => {
          if (userSetting?.[userId] && userSetting[userId]?.type == "NONE") {
            this.muteConvsMap.set(userId, true);
          }
        });

        Object.keys(groupSetting).forEach((groupId) => {
          if (groupSetting?.[groupId] && groupSetting[groupId]?.type == "AT") {
            this.muteConvsMap.set(groupId, true);
          }
        });
        console.log("[ConversationStore] Updated silent mode map:", this.muteConvsMap);
      });
  }

  /**
   * 同步设置会话免打扰状态
   * @param cvs 会话信息
   * @param mute 是否免打扰
   */
  setSilentModeForConversationSync(cvs: ConversationBaseInfo, mute: boolean) {
    console.log("[ConversationStore] Setting silent mode sync for conversation:", cvs, "mute:", mute);
    this.muteConvsMap.set(cvs.conversationId, mute);
  }

  /**
   * 设置会话免打扰
   * @param cvs 会话信息
   */
  setSilentModeForConversation(cvs: Chat.ConversationItem) {
    console.log("[ConversationStore] Setting silent mode for conversation:", cvs);
    ChatUIKIT.getChatConn()
      .setSilentModeForConversation({
        conversationId: cvs.conversationId,
        //@ts-ignore
        type: cvs.conversationType,
        options: {
          paramType: 0,
          //@ts-ignore
          remindType: cvs.conversationType == "groupChat" ? "AT" : "NONE"
        }
      })
      .then((res: any) => {
        this.setSilentModeForConversationSync(cvs, true);
        console.log("[ConversationStore] Successfully set silent mode");
      });
  }

  /**
   * 清除会话免打扰状态
   * @param cvs 会话信息
   */
  clearRemindTypeForConversation(cvs: Chat.ConversationItem) {
    console.log("[ConversationStore] Clearing remind type for conversation:", cvs);
    ChatUIKIT.getChatConn()
      .clearRemindTypeForConversation({
        conversationId: cvs.conversationId,
        //@ts-ignore
        type: cvs.conversationType
      })
      .then((res: any) => {
        this.setSilentModeForConversationSync(cvs, false);
        console.log("[ConversationStore] Successfully cleared remind type");
      });
  }

  /**
   * 置顶会话
   * @param cvs 会话信息
   * @param isPinned 是否置顶
   */
  pinConversation(cvs: Chat.ConversationItem, isPinned: boolean) {
    console.log("[ConversationStore] Pinning conversation:", cvs, "isPinned:", isPinned);
    ChatUIKIT.getChatConn()
      .pinConversation({
        conversationType: cvs.conversationType,
        conversationId: cvs.conversationId,
        isPinned
      })
      .then((res) => {
        this.pinConversationSync(
          cvs,
          isPinned,
          res.data?.pinnedTime || Date.now()
        );
        console.log("[ConversationStore] Successfully pinned conversation");
      });
  }

  /**
   * 同步置顶会话状态
   * @param cvs 会话信息
   * @param isPinned 是否置顶
   * @param pinnedTime 置顶时间
   */
  pinConversationSync(
    cvs: Chat.ConversationItem,
    isPinned: boolean,
    pinnedTime: number
  ) {
    console.log("[ConversationStore] Syncing pin status for conversation:", cvs);
    const conv = this.getConversationById(cvs.conversationId);
    if (conv) {
      conv.isPinned = isPinned;
      conv.pinnedTime = pinnedTime;
    }

    runInAction(() => {
      this.conversationList = [...this.conversationList.sort(sortByPinned)];
    });
    console.log("[ConversationStore] Successfully synced pin status");
  }

  /**
   * 获取会话免打扰状态
   * @param cvsId 会话ID
   */
  getConversationMuteStatus(cvsId: string): boolean {
    const status = this.muteConvsMap.get(cvsId) || false;
    console.log("[ConversationStore] Got mute status for conversation:", cvsId, "status:", status);
    return status;
  }

  /**
   * 根据消息设置@类型
   * @param message 消息对象
   */
  setAtTypeByMessage(message: MixedMessageBody) {
    console.log("[ConversationStore] Setting @ type by message:", message);
    const conversationId = this.getCvsIdFromMessage(message);
    // 在当前会话中不设置@状态
    if (this.currConversation?.conversationId === conversationId) {
      return;
    }
    const isCurrentCvs =
      // @ts-ignore
      this.currConversation?.conversationType == message.chatType &&
      this.currConversation?.conversationId == conversationId;

    if (!isCurrentCvs && message.type === "txt") {
      const mentionList = message?.ext?.em_at_list;
      const user = ChatUIKIT.getChatConn().user;
      if (mentionList && message.from !== user) {
        if (mentionList === AT_ALL || mentionList.includes(user)) {
          ChatUIKIT.convStore.setAtType(
            message.chatType,
            conversationId,
            mentionList === AT_ALL ? "ALL" : "ME"
          );
          console.log("[ConversationStore] Set @ type for conversation");
        }
      }
    }
  }

  /**
   * 设置会话@类型
   * @param chatType 聊天类型
   * @param cvsId 会话ID
   * @param atType @类型
   */
  setAtType(chatType: Chat.ChatType, cvsId: string, atType: AT_TYPE) {
    console.log("[ConversationStore] Setting @ type:", {chatType, cvsId, atType});
    const idx = this.conversationList.findIndex((item) => {
      return (
        item.conversationType === chatType && item.conversationId === cvsId
      );
    });
    if (idx > -1) {
      this.conversationList[idx].atType = atType;
      console.log("[ConversationStore] Successfully set @ type");
    }
  }

  /**
   * 清空会话Store
   */
  clear() {
    console.log("[ConversationStore] Clearing conversation store");
    runInAction(() => {
      this.conversationList = [];
      this.conversationParams = { pageSize: 20, cursor: "" };
      this.pinConversationParams = { pageSize: 20, cursor: "" };
      this.currConversation = null;
    });
    console.log("[ConversationStore] Successfully cleared store");
  }
}

export default ConversationStore;
