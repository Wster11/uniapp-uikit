import { makeAutoObservable, runInAction } from "mobx";
import { GroupEventFromIds } from "../const/index";
import { throttle } from "../utils/index";
import { ChatUIKIT } from "../index";
import { ConnState, Chat } from "../types";
import { chatSDK } from "../sdk";

class ChatStore {
  isInitEvent = false;
  connState: ConnState;
  constructor() {
    this.connState = "none";
    this.initSDKEvent(); // 初始化SDK事件
    makeAutoObservable(this);
  }

  setConnState(state: ConnState) {
    this.connState = state;
  }

  isLogin() {
    return !ChatUIKIT.getChatConn().logout;
  }

  login(params) {
    return ChatUIKIT.getChatConn()
      .open(params)
      .then((res) => {
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

  clearStore() {
    runInAction(() => {
      ChatUIKIT.convStore.clear();
      ChatUIKIT.messageStore.clear();
      ChatUIKIT.contactStore.clear();
      ChatUIKIT.groupStore.clear();
      ChatUIKIT.appUserStore.clear();
    });
  }

  close() {
    this.clearStore();
    return ChatUIKIT.getChatConn().close();
  }

  _throttle = throttle(() => {
    ChatUIKIT.contactStore.deepGetUserInfo([...GroupEventFromIds]);
    GroupEventFromIds.length = 0;
  }, 1000);

  initSDKEvent() {
    if (this.isInitEvent) return;
    this.isInitEvent = true;

    ChatUIKIT.getChatConn().addEventHandler("CONNECTION_STATE", {
      onConnected: () => {
        this.setConnState("connected");
      },
      onDisconnected: () => {
        if (this.isLogin()) {
          this.setConnState("disconnected");
        } else {
          this.setConnState("none");
        }
      },
      onReconnecting: () => {
        this.setConnState("reconnecting");
      }
    });

    ChatUIKIT.getChatConn().addEventHandler("STORE_MULTI_DEVICE", {
      onMultiDeviceEvent: (e) => {
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

    ChatUIKIT.getChatConn().addEventHandler("STORE_MESSAGE", {
      onTextMessage: (msg) => ChatUIKIT.messageStore.onMessage(msg),
      onImageMessage: (msg) => ChatUIKIT.messageStore.onMessage(msg),
      onVideoMessage: (msg) => ChatUIKIT.messageStore.onMessage(msg),
      onAudioMessage: (msg) => ChatUIKIT.messageStore.onMessage(msg),
      onFileMessage: (msg) => ChatUIKIT.messageStore.onMessage(msg),
      onCustomMessage: (msg) => ChatUIKIT.messageStore.onMessage(msg),
      onRecallMessage: (msg) =>
        ChatUIKIT.messageStore.onRecallMessage(msg.mid, msg.from),
      onDeliveredMessage: (msg) => {
        ChatUIKIT.messageStore.updateMessageStatus(msg.mid, "received");
      },
      onReadMessage: (msg) => {
        ChatUIKIT.messageStore.updateMessageStatus(msg.mid, "read");
      },
      onChannelMessage: (msg) => {
        ChatUIKIT.messageStore.setAllMessageRead({
          conversationId: ChatUIKIT.convStore.getCvsIdFromMessage(msg),
          conversationType: msg.chatType
        });
      },
      onModifiedMessage: (msg) => {
        //@ts-ignore
        ChatUIKIT.messageStore.modifyLocalMessage(msg.id, msg);
      }
    });

    ChatUIKIT.getChatConn().addEventHandler("STORE_CONTACT", {
      onContactInvited: (msg) => this.handleContactInvite(msg),
      onContactAgreed: (msg) => this.handleContactAgreed(msg),
      onContactRefuse: (msg) => this.handleContactRefuse(msg),
      onContactDeleted: (msg) => this.handleContactDeleted(msg),
      onContactAdded: (msg) => this.handleContactAdded(msg)
    });

    ChatUIKIT.getChatConn().addEventHandler("STORE_GROUP", {
      onGroupEvent: async (event) => this.handleGroupEvent(event)
    });

    ChatUIKIT.getChatConn().addEventHandler("STORE_Presence", {
      onPresenceStatusChange: (msg) => {
        msg.forEach((presenceInfo) => {
          let ext = presenceInfo.ext;
          const detailList = presenceInfo.statusDetails;
          let isOnline = false;
          detailList.forEach((item) => {
            if (item.status === 1) {
              isOnline = true;
            }
          });
          if (isOnline && presenceInfo.ext === "") {
            ext = "Online";
          }
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

  handleContactInvite(msg) {
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

  handleContactAgreed(msg) {
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKIT.contactStore.addStoreContact({ userId: msg.from, remark: "" });
  }

  handleContactRefuse(msg) {
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
  }

  handleContactDeleted(msg) {
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKIT.contactStore.deleteStoreContact(msg.from);
  }

  handleContactAdded(msg) {
    ChatUIKIT.appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] });
    ChatUIKIT.contactStore.addStoreContact({ userId: msg.from, remark: "" });
  }

  async handleGroupEvent(event) {
    GroupEventFromIds.push(event.from);

    if (["directJoined", "create", "acceptRequest"].includes(event.operation)) {
      const res = await ChatUIKIT.groupStore.getGroupInfo(event.id);
      const info = res.data?.[0];
      if (info) {
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
      ChatUIKIT.groupStore.removeStoreGroup(event.id);
    }

    this._throttle();

    const isDuplicate = ChatUIKIT.groupStore.groupNoticeInfo.list.some(
      (item) => item.operation === "inviteToJoin" && item.id === event.id
    );
    if (!isDuplicate) {
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
    ChatUIKIT.messageStore.insertNoticeMessage(msg);
  }
}

export default ChatStore;
