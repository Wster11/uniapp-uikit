import { makeAutoObservable, runInAction } from "mobx";
import { getTimeStringAutoShort, sortByPinned } from "../utils/index";
import type { ConversationBaseInfo } from "./types/index";
import type {
  MixedMessageBody,
  ChatSDK,
  UIKITConversationItem,
  AT_TYPE
} from "../types/index";
import { AT_ALL } from "../const/index";
import { ChatUIKIT } from "../index";

class ConversationStore {
  conversationList: UIKITConversationItem[] = [];
  currConversation: ConversationBaseInfo | null = null;
  muteConvsMap: Map<string, boolean> = new Map();
  conversationParams: { pageSize: number; cursor: string } = {
    pageSize: 20,
    cursor: ""
  };
  pinConversationParams: { pageSize: number; cursor: string } = {
    pageSize: 20,
    cursor: ""
  };

  deepGetUserInfo = ChatUIKIT.contactStore.deepGetUserInfo;

  constructor() {
    makeAutoObservable(this);
  }

  get totalUnreadCount() {
    return this.conversationList.reduce((prev, curr) => {
      const isMuted = this.muteConvsMap.get(curr.conversationId);
      return prev + (isMuted ? 0 : curr.unReadCount);
    }, 0);
  }

  setConversations(conversations: ChatSDK.ConversationItem[]) {
    if (!Array.isArray(conversations)) {
      return console.error("Invalid parameter: conversations");
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

    this.deepGetUserInfo(userIds);
    this.getSilentModeForConversations(filteredConversations);

    beforeConversations.push(...filteredConversations);

    this.conversationList = [...beforeConversations.sort(sortByPinned)];
  }

  async getConversationList() {
    const res = await ChatUIKIT.getChatConn().getServerConversations(
      this.conversationParams
    );
    this.setConversations(res.data?.conversations || []);
    this.conversationParams.cursor = res.data?.cursor || "";
    if (res.data?.cursor) {
      await this.getConversationList();
    }
    return res;
  }

  async getServerPinnedConversations() {
    const res = await ChatUIKIT.getChatConn().getServerPinnedConversations(
      this.pinConversationParams
    );
    this.setConversations(res.data?.conversations || []);
    this.pinConversationParams.cursor = res.data?.cursor || "";
    if (res.data?.cursor) {
      await this.getServerPinnedConversations();
    } else {
      // 如果没有置顶会话，再获取会话列表
      this.getConversationList();
    }
    return res;
  }

  deleteStoreConversation(conversation: ChatSDK.ConversationItem) {
    const idx = this.conversationList.findIndex(
      (cvs) =>
        cvs.conversationType === conversation.conversationType &&
        cvs.conversationId === conversation.conversationId
    );
    if (idx > -1) {
      this.conversationList.splice(idx, 1);
    }
  }

  async deleteConversation(
    conversation: ChatSDK.ConversationItem,
    deleteMessage = false
  ) {
    if (typeof conversation !== "object") {
      return console.error("Invalid parameter: conversation");
    }
    await ChatUIKIT.getChatConn().deleteConversation({
      channel: conversation.conversationId,
      chatType: conversation.conversationType,
      deleteRoam: deleteMessage
    });
    this.deleteStoreConversation(conversation);
  }

  getConversationById(conversationId: string) {
    return this.conversationList.find(
      (item) => item.conversationId === conversationId
    );
  }

  getConversationTime(message: ChatSDK.ConversationItem["lastMessage"]) {
    if (!message || !message.time) {
      return "";
    }
    return getTimeStringAutoShort(message.time, true);
  }

  clearConversationUnreadCount(conversationId: string) {
    const conv = this.getConversationById(conversationId);
    if (conv) {
      conv.unReadCount = 0;
    }
  }

  async markConversationRead(conversation: ConversationBaseInfo) {
    const msg = ChatUIKIT.connStore.getChatSDK().message.create({
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

  setCurrentConversation(conversation: ConversationBaseInfo | null) {
    this.currConversation = conversation;
  }

  moveConversationTop(conversation: ChatSDK.ConversationItem) {
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
  }

  createConversation(
    conversation: ConversationBaseInfo,
    msg: ChatSDK.MessageBody,
    unReadCount = 0
  ) {
    const conv: ChatSDK.ConversationItem = {
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
    return conv;
  }

  updateConversationLastMessage(
    conversation: ConversationBaseInfo,
    msg: ChatSDK.MessageBody,
    unReadCount = 0
  ) {
    const conv = this.getConversationById(conversation.conversationId);
    if (conv) {
      runInAction(() => {
        conv.lastMessage = msg;
        conv.unReadCount = unReadCount;
      });
    }
  }

  getCvsIdFromMessage(message: MixedMessageBody) {
    if (message.chatType === "groupChat" || message.chatType === "chatRoom") {
      return message.to;
    } else if (
      message.from === ChatUIKIT.getChatConn().user ||
      message.from === ""
    ) {
      return message.to;
    } else {
      return message.from || "";
    }
  }
  // 获取会话的免打扰状态 (单次最多获取20条)
  getSilentModeForConversations(conversationList: ChatSDK.ConversationItem[]) {
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
      });
  }

  setSilentModeForConversationSync(cvs: ConversationBaseInfo, mute: boolean) {
    this.muteConvsMap.set(cvs.conversationId, mute);
  }

  setSilentModeForConversation(cvs: ChatSDK.ConversationItem) {
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
      });
  }

  clearRemindTypeForConversation(cvs: ChatSDK.ConversationItem) {
    ChatUIKIT.getChatConn()
      .clearRemindTypeForConversation({
        conversationId: cvs.conversationId,
        //@ts-ignore
        type: cvs.conversationType
      })
      .then((res: any) => {
        this.setSilentModeForConversationSync(cvs, false);
      });
  }

  pinConversation(cvs: ChatSDK.ConversationItem, isPinned: boolean) {
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
      });
  }

  pinConversationSync(
    cvs: ChatSDK.ConversationItem,
    isPinned: boolean,
    pinnedTime: number
  ) {
    const conv = this.getConversationById(cvs.conversationId);
    if (conv) {
      conv.isPinned = isPinned;
      conv.pinnedTime = pinnedTime;
    }

    runInAction(() => {
      this.conversationList = [...this.conversationList.sort(sortByPinned)];
    });
  }

  getConversationMuteStatus(cvsId: string): boolean {
    return this.muteConvsMap.get(cvsId) || false;
  }

  setAtTypeByMessage(message: MixedMessageBody) {
    const conversationId = this.getCvsIdFromMessage(message);
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
        }
      }
    }
  }

  setAtType(chatType: ChatSDK.ChatType, cvsId: string, atType: AT_TYPE) {
    const idx = this.conversationList.findIndex((item) => {
      return (
        item.conversationType === chatType && item.conversationId === cvsId
      );
    });
    if (idx > -1) {
      this.conversationList[idx].atType = atType;
    }
  }

  clear() {
    runInAction(() => {
      this.conversationList = [];
      this.conversationParams = { pageSize: 20, cursor: "" };
      this.pinConversationParams = { pageSize: 20, cursor: "" };
      this.currConversation = null;
    });
  }
}

export default ConversationStore;
