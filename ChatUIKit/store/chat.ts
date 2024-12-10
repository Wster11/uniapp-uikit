import { makeAutoObservable, runInAction } from "mobx";
import { GroupEventFromIds } from "../const/index";
import { throttle } from "../utils/index";
import { ChatUIKit } from "../index";
import { ConnState, Chat } from "../types";
import { chatSDK } from "../sdk";
import { logger } from "../log";

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
    logger.info("[ChatStore] Initializing...");
    this.connState = "none";
    this.initSDKEvent(); // 初始化SDK事件
    makeAutoObservable(this);
  }

  /**
   * 设置连接状态
   * @param state 连接状态
   */
  setConnState(state: ConnState) {
    logger.info("[ChatStore] Connection state changed to:", state);
    this.connState = state;
  }

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  isLogin() {
    return !ChatUIKit.getChatConn().logout;
  }

  /**
   * 登录聊天服务
   * @param params 登录参数
   * @returns Promise 登录结果
   */
  login(params) {
    logger.info("[ChatStore] Attempting login for user:", params.user);
    return ChatUIKit.getChatConn()
      .open(params)
      .then((res) => {
        logger.info("[ChatStore] Login successful");
        runInAction(() => {
          const featureConfig = ChatUIKit.configStore.getFeatureConfig();
          if (featureConfig.pinConversation) {
            ChatUIKit.convStore.getServerPinnedConversations();
          } else {
            ChatUIKit.convStore.getConversationList();
          }
          ChatUIKit.contactStore.getContacts();
          ChatUIKit.groupStore.getJoinedGroupList();
          ChatUIKit.appUserStore.getUsersInfoFromServer({
            userIdList: [params.user]
          });
          ChatUIKit.appUserStore.getUsersPresenceFromServer({
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
    logger.info("[ChatStore] Clearing all stores");
    runInAction(() => {
      ChatUIKit.convStore.clear();
      ChatUIKit.messageStore.clear();
      ChatUIKit.contactStore.clear();
      ChatUIKit.groupStore.clear();
      ChatUIKit.appUserStore.clear();
    });
  }

  /**
   * 关闭聊天连接
   * @returns Promise
   */
  close() {
    logger.info("[ChatStore] Closing connection");
    this.clearStore();
    return ChatUIKit.getChatConn().close();
  }

  /** 节流处理用户信息获取 */
  _throttle = throttle(() => {
    logger.info("[ChatStore] Throttled user info fetch for users:", GroupEventFromIds);
    ChatUIKit.contactStore.deepGetUserInfo([...GroupEventFromIds]);
    GroupEventFromIds.length = 0;
  }, 1000);

  /**
   * 初始化SDK事件监听
   */
  initSDKEvent() {
    if (this.isInitEvent) return;
    logger.info("[ChatStore] Initializing SDK events");
    this.isInitEvent = true;

    // 连接状态事件处理
    ChatUIKit.getChatConn().addEventHandler("CONNECTION_STATE", {
      onConnected: () => {
        logger.info("[ChatStore] Connection established");
        this.setConnState("connected");
      },
      onDisconnected: () => {
        logger.warn("[ChatStore] Connection lost");
        if (this.isLogin()) {
          this.setConnState("disconnected");
        } else {
          this.setConnState("none");
        }
      },
      onReconnecting: () => {
        logger.info("[ChatStore] Attempting to reconnect");
        this.setConnState("reconnecting");
      }
    });

    // 多设备事件处理
    ChatUIKit.getChatConn().addEventHandler("STORE_MULTI_DEVICE", {
      onMultiDeviceEvent: (e) => {
        logger.info("[ChatStore] Multi-device event:", e.operation);
        switch (e.operation) {
          case "deleteConversation":
            const conv = ChatUIKit.convStore.getConversationById(
              e.conversationId
            );
            if (conv) {
              ChatUIKit.convStore.deleteConversation(conv);
            }
            break;
          case "setSilentModeForConversation":
            ChatUIKit.convStore.setSilentModeForConversationSync(
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
            ChatUIKit.convStore.setSilentModeForConversationSync(
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
            ChatUIKit.convStore.pinConversationSync(
              {
                conversationId: e.conversationId,
                conversationType: e.conversationType
              } as Chat.ConversationItem,
              true,
              e.timestamp
            );
            break;
          case "unpinnedConversation":
            ChatUIKit.convStore.pinConversationSync(
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
    ChatUIKit.getChatConn().addEventHandler("STORE_MESSAGE", {
      onTextMessage: (msg) => {
        logger.info("[ChatStore] Received text message from:", msg.from);
        ChatUIKit.messageStore.onMessage(msg);
      },
      onImageMessage: (msg) => {
        logger.info("[ChatStore] Received image message from:", msg.from);
        ChatUIKit.messageStore.onMessage(msg);
      },
      onVideoMessage: (msg) => {
        logger.info("[ChatStore] Received video message from:", msg.from);
        ChatUIKit.messageStore.onMessage(msg);
      },
      onAudioMessage: (msg) => {
        logger.info("[ChatStore] Received audio message from:", msg.from);
        ChatUIKit.messageStore.onMessage(msg);
      },
      onFileMessage: (msg) => {
        logger.info("[ChatStore] Received file message from:", msg.from);
        ChatUIKit.messageStore.onMessage(msg);
      },
      onCustomMessage: (msg) => {
        logger.info("[ChatStore] Received custom message from:", msg.from);
        ChatUIKit.messageStore.onMessage(msg);
      },
      onRecallMessage: (msg) => {
        logger.info("[ChatStore] Message recalled by:", msg.from);
        ChatUIKit.messageStore.onRecallMessage(msg.mid, msg.from);
      },
      onDeliveredMessage: (msg) => {
        logger.info("[ChatStore] Message delivered:", msg.mid);
        ChatUIKit.messageStore.updateMessageStatus(msg.mid || "", "received");
      },
      onReadMessage: (msg) => {
        logger.info("[ChatStore] Message read:", msg.mid);
        ChatUIKit.messageStore.updateMessageStatus(msg.mid || "", "read");
      },
      onChannelMessage: (msg) => {
        logger.info("[ChatStore] Channel message from:", msg.from);
        // 多端同步消息不需要处理
        if (msg.from === ChatUIKit.getChatConn().user) return;
        ChatUIKit.messageStore.setAllMessageRead({
          conversationId: ChatUIKit.convStore.getCvsIdFromMessage(msg),
          conversationType: msg.chatType
        });
      },
      onModifiedMessage: (msg) => {
        logger.info("[ChatStore] Message modified:", msg.id);
        //@ts-ignore
        ChatUIKit.messageStore.modifyLocalMessage(msg.id, msg);
      }
    });

    // 联系人事件处理
    ChatUIKit.getChatConn().addEventHandler("STORE_CONTACT", {
      onContactInvited: (msg) => {
        logger.info("[ChatStore] Contact invitation from:", msg.from);
        this.handleContactInvite(msg);
      },
      onContactAgreed: (msg) => {
        logger.info("[ChatStore] Contact request accepted by:", msg.from);
        this.handleContactAgreed(msg);
      },
      onContactRefuse: (msg) => {
        logger.info("[ChatStore] Contact request refused by:", msg.from);
        this.handleContactRefuse(msg);
      },
      onContactDeleted: (msg) => {
        logger.info("[ChatStore] Contact deleted by:", msg.from);
        this.handleContactDeleted(msg);
      },
      onContactAdded: (msg) => {
        logger.info("[ChatStore] Contact added:", msg.from);
        this.handleContactAdded(msg);
      }
    });

    // 群组事件处理
    ChatUIKit.getChatConn().addEventHandler("STORE_GROUP", {
      onGroupEvent: async (event) => {
        logger.info("[ChatStore] Group event:", event.operation, "for group:", event.id);
        // 群组事件暂时不处理
        // this.handleGroupEvent(event);
      }
    });

    // 在线状态事件处理
    ChatUIKit.getChatConn().addEventHandler("STORE_Presence", {
      onPresenceStatusChange: (msg) => {
        logger.info("[ChatStore] Presence status changed for users:", msg.map(p => p.userId));
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
            ChatUIKit.appUserStore.setUserPresence(presenceInfo.userId, {
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
    logger.info("[ChatStore] Processing contact invite from:", msg.from);
    const notice = {
      ...msg,
      ext: "invited",
      time: Date.now()
    };
    ChatUIKit.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });

    const isDuplicate = ChatUIKit.contactStore.contactsNoticeInfo.list.some(
      (item) => item.type === "subscribe" && item.from === msg.from
    );
    if (!isDuplicate) ChatUIKit.contactStore.addContactNotice(notice);
  }

  /**
   * 处理联系人同意事件
   * @param msg 同意消息
   */
  handleContactAgreed(msg) {
    logger.info("[ChatStore] Processing contact agreement from:", msg.from);
    ChatUIKit.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKit.contactStore.addStoreContact({ userId: msg.from, remark: "" });
  }

  /**
   * 处理联系人拒绝事件
   * @param msg 拒绝消息
   */
  handleContactRefuse(msg) {
    logger.info("[ChatStore] Processing contact refusal from:", msg.from);
    ChatUIKit.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
  }

  /**
   * 处理联系人删除事件
   * @param msg 删除消息
   */
  handleContactDeleted(msg) {
    logger.info("[ChatStore] Processing contact deletion from:", msg.from);
    ChatUIKit.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKit.contactStore.deleteStoreContact(msg.from);
  }

  /**
   * 处理联系人添加事件
   * @param msg 添加消息
   */
  handleContactAdded(msg) {
    logger.info("[ChatStore] Processing contact addition for:", msg.from);
    ChatUIKit.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKit.contactStore.addStoreContact({ userId: msg.from, remark: "" });
  }

  /**
   * 处理群组事件
   * @param event 群组事件
   */
  async handleGroupEvent(event) {
    logger.info("[ChatStore] Processing group event:", event.operation, "for group:", event.id);
    GroupEventFromIds.push(event.from);

    if (["directJoined", "create", "acceptRequest"].includes(event.operation)) {
      const res = await ChatUIKit.groupStore.getGroupInfo(event.id);
      const info = res.data?.[0];
      if (info) {
        logger.info("[ChatStore] Adding group to joined list:", info.id);
        ChatUIKit.groupStore.setJoinedGroupList([
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
      logger.info("[ChatStore] Removing group from store:", event.id);
      ChatUIKit.groupStore.removeStoreGroup(event.id);
    }

    this._throttle();

    const isDuplicate = ChatUIKit.groupStore.groupNoticeInfo.list.some(
      (item) => item.operation === "inviteToJoin" && item.id === event.id
    );
    if (!isDuplicate) {
      logger.info("[ChatStore] Adding group notice for:", event.id);
      ChatUIKit.groupStore.addGroupNotice({
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
    logger.info("[ChatStore] Inserting notice message for group event");
    ChatUIKit.messageStore.insertNoticeMessage(msg);
  }
}

export default ChatStore;
