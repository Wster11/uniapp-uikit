import { makeAutoObservable, runInAction } from "mobx";
import { GroupEventFromIds } from "../const/index";
import { throttle } from "../utils/index";
import { ChatUIKIT } from "../index";
import { ConnState, Chat } from "../types";
import { chatSDK } from "../sdk";

/**
 * 聊天管理类
 * 负责管理聊天相关的状态和事件处理
 */
class ChatStore {
  /** 是否已初始化SDK事件 */
  isInitEvent = false;
  /** 连接状态 */
  connState: ConnState;

  constructor() {
    console.log("[ChatStore] Initializing...");
    this.connState = "none";
    this.initSDKEvent(); // 初始化SDK事件
    makeAutoObservable(this);
  }

  /**
   * 设置连接状态
   * @param state 连接状态
   */
  setConnState(state: ConnState) {
    console.log("[ChatStore] Connection state changed to:", state);
    this.connState = state;
  }

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  isLogin() {
    return !ChatUIKIT.getChatConn().logout;
  }

  /**
   * 登录聊天服务
   * @param params 登录参数
   * @returns Promise 登录结果
   */
  login(params) {
    console.log("[ChatStore] Attempting login for user:", params.user);
    return ChatUIKIT.getChatConn()
      .open(params)
      .then((res) => {
        console.log("[ChatStore] Login successful");
        runInAction(() => {
          const featureConfig = ChatUIKIT.configStore.getFeatureConfig();
          if (featureConfig.pinConversation) {
            ChatUIKIT.convStore.getServerPinnedConversations();
          } else {
            ChatUIKIT.convStore.getConversationList();
          }
          ChatUIKIT.contactStore.getContacts();
          ChatUIKIT.groupStore.getJoinedGroupList();
          ChatUIKIT.appUserStore.getUsersInfoFromServer({
            userIdList: [params.user]
          });
          ChatUIKIT.appUserStore.getUsersPresenceFromServer({
            userIdList: [params.user]
          });
        });
        return res;
      });
  }

  /**
   * 清空所有存储数据
   */
  clearStore() {
    console.log("[ChatStore] Clearing all stores");
    runInAction(() => {
      ChatUIKIT.convStore.clear();
      ChatUIKIT.messageStore.clear();
      ChatUIKIT.contactStore.clear();
      ChatUIKIT.groupStore.clear();
      ChatUIKIT.appUserStore.clear();
    });
  }

  /**
   * 关闭聊天连接
   * @returns Promise
   */
  close() {
    console.log("[ChatStore] Closing connection");
    this.clearStore();
    return ChatUIKIT.getChatConn().close();
  }

  /** 节流处理用户信息获取 */
  _throttle = throttle(() => {
    console.log("[ChatStore] Throttled user info fetch for users:", GroupEventFromIds);
    ChatUIKIT.contactStore.deepGetUserInfo([...GroupEventFromIds]);
    GroupEventFromIds.length = 0;
  }, 1000);

  /**
   * 初始化SDK事件监听
   */
  initSDKEvent() {
    if (this.isInitEvent) return;
    console.log("[ChatStore] Initializing SDK events");
    this.isInitEvent = true;

    // 连接状态事件处理
    ChatUIKIT.getChatConn().addEventHandler("CONNECTION_STATE", {
      onConnected: () => {
        console.log("[ChatStore] Connection established");
        this.setConnState("connected");
      },
      onDisconnected: () => {
        console.log("[ChatStore] Connection lost");
        if (this.isLogin()) {
          this.setConnState("disconnected");
        } else {
          this.setConnState("none");
        }
      },
      onReconnecting: () => {
        console.log("[ChatStore] Attempting to reconnect");
        this.setConnState("reconnecting");
      }
    });

    // 多设备事件处理
    ChatUIKIT.getChatConn().addEventHandler("STORE_MULTI_DEVICE", {
      onMultiDeviceEvent: (e) => {
        console.log("[ChatStore] Multi-device event:", e.operation);
        switch (e.operation) {
          case "deleteConversation":
            const conv = ChatUIKIT.convStore.getConversationById(
              e.conversationId
            );
            if (conv) {
              ChatUIKIT.convStore.deleteConversation(conv);
            }
            break;
          case "setSilentModeForConversation":
            ChatUIKIT.convStore.setSilentModeForConversationSync(
              {
                conversationType: (e as Chat.NotificationConMultiDeviceInfo)
                  .type,
                conversationId: (e as Chat.NotificationConMultiDeviceInfo)
                  .conversationId
              },
              true
            );
            break;
          case "removeSilentModeForConversation":
            ChatUIKIT.convStore.setSilentModeForConversationSync(
              {
                conversationType: (e as Chat.NotificationConMultiDeviceInfo)
                  .type,
                conversationId: (e as Chat.NotificationConMultiDeviceInfo)
                  .conversationId
              },
              false
            );
            break;
          case "pinnedConversation":
            ChatUIKIT.convStore.pinConversationSync(
              {
                conversationId: e.conversationId,
                conversationType: e.conversationType
              } as Chat.ConversationItem,
              true,
              e.timestamp
            );
            break;
          case "unpinnedConversation":
            ChatUIKIT.convStore.pinConversationSync(
              {
                conversationId: e.conversationId,
                conversationType: e.conversationType
              } as Chat.ConversationItem,
              false,
              e.timestamp
            );
            break;
          default:
            break;
        }
      }
    });

    // 消息事件处理
    ChatUIKIT.getChatConn().addEventHandler("STORE_MESSAGE", {
      onTextMessage: (msg) => {
        console.log("[ChatStore] Received text message from:", msg.from);
        ChatUIKIT.messageStore.onMessage(msg);
      },
      onImageMessage: (msg) => {
        console.log("[ChatStore] Received image message from:", msg.from);
        ChatUIKIT.messageStore.onMessage(msg);
      },
      onVideoMessage: (msg) => {
        console.log("[ChatStore] Received video message from:", msg.from);
        ChatUIKIT.messageStore.onMessage(msg);
      },
      onAudioMessage: (msg) => {
        console.log("[ChatStore] Received audio message from:", msg.from);
        ChatUIKIT.messageStore.onMessage(msg);
      },
      onFileMessage: (msg) => {
        console.log("[ChatStore] Received file message from:", msg.from);
        ChatUIKIT.messageStore.onMessage(msg);
      },
      onCustomMessage: (msg) => {
        console.log("[ChatStore] Received custom message from:", msg.from);
        ChatUIKIT.messageStore.onMessage(msg);
      },
      onRecallMessage: (msg) => {
        console.log("[ChatStore] Message recalled by:", msg.from);
        ChatUIKIT.messageStore.onRecallMessage(msg.mid, msg.from);
      },
      onDeliveredMessage: (msg) => {
        console.log("[ChatStore] Message delivered:", msg.mid);
        ChatUIKIT.messageStore.updateMessageStatus(msg.mid || "", "received");
      },
      onReadMessage: (msg) => {
        console.log("[ChatStore] Message read:", msg.mid);
        ChatUIKIT.messageStore.updateMessageStatus(msg.mid || "", "read");
      },
      onChannelMessage: (msg) => {
        console.log("[ChatStore] Channel message from:", msg.from);
        // 多端同步消息不需要处理
        if (msg.from === ChatUIKIT.getChatConn().user) return;
        ChatUIKIT.messageStore.setAllMessageRead({
          conversationId: ChatUIKIT.convStore.getCvsIdFromMessage(msg),
          conversationType: msg.chatType
        });
      },
      onModifiedMessage: (msg) => {
        console.log("[ChatStore] Message modified:", msg.id);
        //@ts-ignore
        ChatUIKIT.messageStore.modifyLocalMessage(msg.id, msg);
      }
    });

    // 联系人事件处理
    ChatUIKIT.getChatConn().addEventHandler("STORE_CONTACT", {
      onContactInvited: (msg) => {
        console.log("[ChatStore] Contact invitation from:", msg.from);
        this.handleContactInvite(msg);
      },
      onContactAgreed: (msg) => {
        console.log("[ChatStore] Contact request accepted by:", msg.from);
        this.handleContactAgreed(msg);
      },
      onContactRefuse: (msg) => {
        console.log("[ChatStore] Contact request refused by:", msg.from);
        this.handleContactRefuse(msg);
      },
      onContactDeleted: (msg) => {
        console.log("[ChatStore] Contact deleted by:", msg.from);
        this.handleContactDeleted(msg);
      },
      onContactAdded: (msg) => {
        console.log("[ChatStore] Contact added:", msg.from);
        this.handleContactAdded(msg);
      }
    });

    // 群组事件处理
    ChatUIKIT.getChatConn().addEventHandler("STORE_GROUP", {
      onGroupEvent: async (event) => {
        console.log("[ChatStore] Group event:", event.operation, "for group:", event.id);
        this.handleGroupEvent(event);
      }
    });

    // 在线状态事件处理
    ChatUIKIT.getChatConn().addEventHandler("STORE_Presence", {
      onPresenceStatusChange: (msg) => {
        console.log("[ChatStore] Presence status changed for users:", msg.map(p => p.userId));
        msg.forEach((presenceInfo) => {
          let ext = presenceInfo.ext;
          const detailList = presenceInfo.statusDetails;
          let isOnline = false;
          detailList.forEach((item) => {
            if (item.status === 1) {
              isOnline = true;
            }
          });
          runInAction(() => {
            ChatUIKIT.appUserStore.setUserPresence(presenceInfo.userId, {
              presenceExt: ext,
              isOnline
            });
          });
        });
      }
    });
  }

  /**
   * 处理联系人邀请事件
   * @param msg 邀请消息
   */
  handleContactInvite(msg) {
    console.log("[ChatStore] Processing contact invite from:", msg.from);
    const notice = {
      ...msg,
      ext: "invited",
      time: Date.now()
    };
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });

    const isDuplicate = ChatUIKIT.contactStore.contactsNoticeInfo.list.some(
      (item) => item.type === "subscribe" && item.from === msg.from
    );
    if (!isDuplicate) ChatUIKIT.contactStore.addContactNotice(notice);
  }

  /**
   * 处理联系人同意事件
   * @param msg 同意消息
   */
  handleContactAgreed(msg) {
    console.log("[ChatStore] Processing contact agreement from:", msg.from);
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKIT.contactStore.addStoreContact({ userId: msg.from, remark: "" });
  }

  /**
   * 处理联系人拒绝事件
   * @param msg 拒绝消息
   */
  handleContactRefuse(msg) {
    console.log("[ChatStore] Processing contact refusal from:", msg.from);
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
  }

  /**
   * 处理联系人删除事件
   * @param msg 删除消息
   */
  handleContactDeleted(msg) {
    console.log("[ChatStore] Processing contact deletion from:", msg.from);
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKIT.contactStore.deleteStoreContact(msg.from);
  }

  /**
   * 处理联系人添加事件
   * @param msg 添加消息
   */
  handleContactAdded(msg) {
    console.log("[ChatStore] Processing contact addition for:", msg.from);
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKIT.contactStore.addStoreContact({ userId: msg.from, remark: "" });
  }

  /**
   * 处理群组事件
   * @param event 群组事件
   */
  async handleGroupEvent(event) {
    console.log("[ChatStore] Processing group event:", event.operation, "for group:", event.id);
    GroupEventFromIds.push(event.from);

    if (["directJoined", "create", "acceptRequest"].includes(event.operation)) {
      const res = await ChatUIKIT.groupStore.getGroupInfo(event.id);
      const info = res.data?.[0];
      if (info) {
        console.log("[ChatStore] Adding group to joined list:", info.id);
        ChatUIKIT.groupStore.setJoinedGroupList([
          {
            groupId: info.id,
            groupName: info.name,
            public: info.public,
            description: info.description,
            disabled: true,
            allowInvites: info.allowinvites,
            maxUsers: info.maxusers,
            approval: info.membersonly
          }
        ]);
      }
    } else if (["removeMember", "destroy"].includes(event.operation)) {
      console.log("[ChatStore] Removing group from store:", event.id);
      ChatUIKIT.groupStore.removeStoreGroup(event.id);
    }

    this._throttle();

    const isDuplicate = ChatUIKIT.groupStore.groupNoticeInfo.list.some(
      (item) => item.operation === "inviteToJoin" && item.id === event.id
    );
    if (!isDuplicate) {
      console.log("[ChatStore] Adding group notice for:", event.id);
      ChatUIKIT.groupStore.addGroupNotice({
        ...event,
        time: Date.now(),
        showOperation: event.operation === "inviteToJoin"
      });
    }

    const msg = chatSDK.message.create({
      type: "txt",
      to: event.id,
      chatType: "groupChat",
      msg: ``
    });
    msg.noticeInfo = {
      type: "notice",
      noticeType: "group",
      ext: { from: event.from, operation: event.operation }
    };
    console.log("[ChatStore] Inserting notice message for group event");
    ChatUIKIT.messageStore.insertNoticeMessage(msg);
  }
}

export default ChatStore;
