import { makeAutoObservable, runInAction } from "mobx";
import type { EasemobChat } from "easemob-websdk/Easemob-chat";
import { getTimeStringAutoShort } from "../utils/index";
import type { ConversationBaseInfo } from "./types/index";
import type { MixedMessageBody } from "../types/index";
import { EaseConnKit } from "../index";

class ConversationStore {
  conversationList: EasemobChat.ConversationItem[] = [];
  currConversation: ConversationBaseInfo | null = null;
  conversationParams: { pageSize: number; cursor: string } = {
    pageSize: 50,
    cursor: ""
  };
  deepGetUserInfo = EaseConnKit.contactStore.deepGetUserInfo;

  constructor() {
    makeAutoObservable(this);
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

    const userIds = filteredConversations
      .filter(
        (conversationItem) => conversationItem.conversationType === "singleChat"
      )
      .map((conversationItem) => conversationItem.conversationId);

    this.deepGetUserInfo(userIds);

    runInAction(() => {
      this.conversationList.push(...filteredConversations);
    });
  }

  setConversationParams(p: { pageSize: number; cursor: string }) {
    runInAction(() => {
      this.conversationParams.pageSize = p.pageSize;
      this.conversationParams.cursor = p.cursor;
    });
  }

  async getConversationList() {
    const res = await EaseConnKit.getChatConn().getServerConversations(
      this.conversationParams
    );
    this.setConversations(res.data?.conversations || []);
    runInAction(() => {
      this.conversationParams.cursor = res.data?.cursor;
    });
    if (res.data?.cursor) {
      await this.getConversationList();
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
      runInAction(() => {
        this.conversationList.splice(idx, 1);
      });
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
    runInAction(() => {
      const conv = this.getConversationById(conversation.conversationId);
      if (conv) {
        conv.unReadCount = 0;
      }
    });
  }

  setCurrentConversation(conversation: ConversationBaseInfo | null) {
    runInAction(() => {
      this.currConversation = conversation;
    });
  }

  moveConversationTop(conversation: EasemobChat.ConversationItem) {
    const conv = this.getConversationById(conversation.conversationId);
    if (conv) {
      const idx = this.conversationList.findIndex(
        (item) => item.conversationId === conversation.conversationId
      );
      if (idx > -1) {
        runInAction(() => {
          this.conversationList.splice(idx, 1);
          this.conversationList.unshift(conversation);
        });
      }
    } else {
      runInAction(() => {
        this.conversationList.unshift(conversation);
      });
    }
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
      unReadCount
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

  clear() {
    runInAction(() => {
      this.conversationList = [];
      this.conversationParams = { pageSize: 50, cursor: "" };
      this.currConversation = null;
    });
  }
}

export default ConversationStore;
