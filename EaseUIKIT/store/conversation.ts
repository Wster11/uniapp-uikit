import { makeAutoObservable, runInAction } from "mobx";
import type { EasemobChat } from "easemob-websdk/Easemob-chat";
import { getTimeStringAutoShort, sortByPinned } from "../utils/index";
import type { ConversationBaseInfo } from "./types/index";
import type { MixedMessageBody } from "../types/index";
import { EaseConnKit } from "../index";

class ConversationStore {
  conversationList: EasemobChat.ConversationItem[] = [];
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

  deepGetUserInfo = EaseConnKit.contactStore.deepGetUserInfo;

  constructor() {
    makeAutoObservable(this);
  }

  get totalUnreadCount() {
    return this.conversationList.reduce((prev, curr) => {
      const isMuted = this.muteConvsMap.get(curr.conversationId);
      return prev + (isMuted ? 0 : curr.unReadCount);
    }, 0);
  }

  setConversations(conversations: EasemobChat.ConversationItem[]) {
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
    const res = await EaseConnKit.getChatConn().getServerConversations(
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
    const res = await EaseConnKit.getChatConn().getServerPinnedConversations(
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

  deleteStoreConversation(conversation: EasemobChat.ConversationItem) {
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
    conversation: EasemobChat.ConversationItem,
    deleteMessage = false
  ) {
    if (typeof conversation !== "object") {
      return console.error("Invalid parameter: conversation");
    }
    await EaseConnKit.getChatConn().deleteConversation({
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

  getConversationTime(message: EasemobChat.ConversationItem["lastMessage"]) {
    if (!message || !message.time) {
      return "";
    }
    return getTimeStringAutoShort(message.time);
  }

  async markConversationRead(conversation: ConversationBaseInfo) {
    const msg = EaseConnKit.connStore.getChatSDK().message.create({
      type: "channel",
      chatType: conversation.conversationType,
      to: conversation.conversationId
    });
    await EaseConnKit.getChatConn().send(msg);
    const conv = this.getConversationById(conversation.conversationId);
    if (conv) {
      conv.unReadCount = 0;
    }
  }

  setCurrentConversation(conversation: ConversationBaseInfo | null) {
    this.currConversation = conversation;
  }

  moveConversationTop(conversation: EasemobChat.ConversationItem) {
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
    msg: EasemobChat.MessageBody,
    unReadCount = 0
  ) {
    const conv: EasemobChat.ConversationItem = {
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
    msg: EasemobChat.MessageBody,
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
      message.from === EaseConnKit.getChatConn().user ||
      message.from === ""
    ) {
      return message.to;
    } else {
      return message.from || "";
    }
  }
  // 获取会话的免打扰状态 (单次最多获取20条)
  getSilentModeForConversations(
    conversationList: EasemobChat.ConversationItem[]
  ) {
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
    EaseConnKit.getChatConn()
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

  setSilentModeForConversation(cvs: EasemobChat.ConversationItem) {
    EaseConnKit.getChatConn()
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

  clearRemindTypeForConversation(cvs: EasemobChat.ConversationItem) {
    EaseConnKit.getChatConn()
      .clearRemindTypeForConversation({
        conversationId: cvs.conversationId,
        //@ts-ignore
        type: cvs.conversationType
      })
      .then((res: any) => {
        this.setSilentModeForConversationSync(cvs, false);
      });
  }

  pinConversation(cvs: EasemobChat.ConversationItem, isPinned: boolean) {
    EaseConnKit.getChatConn()
      .pinConversation({
        conversationType: cvs.conversationType,
        conversationId: cvs.conversationId,
        isPinned
      })
      .then((res) => {
        const conv = this.getConversationById(cvs.conversationId);
        if (conv) {
          conv.isPinned = isPinned;
          conv.pinnedTime = res.data?.pinnedTime || Date.now();
        }

        runInAction(() => {
          this.conversationList = [...this.conversationList.sort(sortByPinned)];
        });
      });
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
