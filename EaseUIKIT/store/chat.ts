import { makeAutoObservable, runInAction } from "mobx";
import { GroupEventFromIds } from "../const/index";
import { throttle } from "../utils/index";
import { EaseConnKit } from "../index";
import { EasemobChat } from "easemob-websdk/Easemob-chat";

class ChatStore {
  isInitEvent = false;
  SDK = EaseConnKit.connStore.getChatSDK();
  constructor() {
    makeAutoObservable(this);
    this.initSDKEvent(); // 初始化SDK事件
  }

  login(params) {
    return EaseConnKit.getChatConn()
      .open(params)
      .then((res) => {
        runInAction(() => {
          EaseConnKit.convStore.getConversationList();
          EaseConnKit.contactStore.getContacts();
          EaseConnKit.groupStore.getJoinedGroupList();
          EaseConnKit.blockStore.getBlockList();
          EaseConnKit.appUserStore.getUsersInfo({
            userIdList: [params.user]
          });
        });
        return res;
      });
  }

  clearStore() {
    runInAction(() => {
      EaseConnKit.convStore.clear();
      EaseConnKit.messageStore.clear();
      EaseConnKit.contactStore.clear();
      EaseConnKit.groupStore.clear();
      EaseConnKit.blockStore.clear();
      EaseConnKit.appUserStore.clear();
    });
  }

  close() {
    this.clearStore();
    return EaseConnKit.getChatConn().close();
  }

  _throttle = throttle(() => {
    EaseConnKit.contactStore.deepGetUserInfo([...GroupEventFromIds]);
    GroupEventFromIds.length = 0;
  }, 1000);

  initSDKEvent() {
    if (this.isInitEvent) return;
    this.isInitEvent = true;

    EaseConnKit.getChatConn().addEventHandler("STORE_MULTI_DEVICE", {
      onMultiDeviceEvent: (e) => {
        if (e.operation === "deleteConversation") {
          const conv = EaseConnKit.convStore.getConversationById(
            e.conversationId
          );
          if (conv) {
            EaseConnKit.convStore.deleteConversation(conv);
          }
        } else if (e.operation === "setSilentModeForConversation") {
          EaseConnKit.convStore.setSilentModeForConversationSync(
            {
              conversationType: (
                e as EasemobChat.NotificationConMultiDeviceInfo
              ).type,
              conversationId: (e as EasemobChat.NotificationConMultiDeviceInfo)
                .conversationId
            },
            true
          );
        } else if (e.operation === "removeSilentModeForConversation") {
          EaseConnKit.convStore.setSilentModeForConversationSync(
            {
              conversationType: (
                e as EasemobChat.NotificationConMultiDeviceInfo
              ).type,
              conversationId: (e as EasemobChat.NotificationConMultiDeviceInfo)
                .conversationId
            },
            false
          );
        }
      }
    });

    EaseConnKit.getChatConn().addEventHandler("STORE_MESSAGE", {
      onTextMessage: (msg) => EaseConnKit.messageStore.onMessage(msg),
      onImageMessage: (msg) => EaseConnKit.messageStore.onMessage(msg),
      onVideoMessage: (msg) => EaseConnKit.messageStore.onMessage(msg),
      onAudioMessage: (msg) => EaseConnKit.messageStore.onMessage(msg),
      onRecallMessage: (msg) =>
        EaseConnKit.messageStore.onRecallMessage(msg.mid, msg.from)
    });

    EaseConnKit.getChatConn().addEventHandler("STORE_CONTACT", {
      onContactInvited: (msg) => this.handleContactInvite(msg),
      onContactAgreed: (msg) => this.handleContactAgreed(msg),
      onContactRefuse: (msg) => this.handleContactRefuse(msg),
      onContactDeleted: (msg) => this.handleContactDeleted(msg),
      onContactAdded: (msg) => this.handleContactAdded(msg)
    });

    EaseConnKit.getChatConn().addEventHandler("STORE_GROUP", {
      onGroupEvent: async (event) => this.handleGroupEvent(event)
    });
  }

  handleContactInvite(msg) {
    const notice = {
      ...msg,
      ext: "invited",
      time: Date.now(),
      showOperation: true
    };
    EaseConnKit.appUserStore.getUsersInfo({ userIdList: [msg.from] });

    const isDuplicate = EaseConnKit.contactStore.contactsNoticeInfo.list.some(
      (item) =>
        item.type === "subscribe" &&
        item.from === msg.from &&
        item.showOperation === true
    );
    if (!isDuplicate) EaseConnKit.contactStore.addContactNotice(notice);
  }

  handleContactAgreed(msg) {
    const notice = { ...msg, ext: "agreed", time: Date.now() };
    EaseConnKit.appUserStore.getUsersInfo({ userIdList: [msg.from] });
    EaseConnKit.contactStore.addStoreContact({ userId: msg.from, remark: "" });
    EaseConnKit.contactStore.addContactNotice(notice);
  }

  handleContactRefuse(msg) {
    const notice = { ...msg, ext: "refused", time: Date.now() };
    EaseConnKit.appUserStore.getUsersInfo({ userIdList: [msg.from] });
    EaseConnKit.contactStore.addContactNotice(notice);
  }

  handleContactDeleted(msg) {
    const notice = { ...msg, ext: "deleted", time: Date.now() };
    EaseConnKit.appUserStore.getUsersInfo({ userIdList: [msg.from] });
    EaseConnKit.contactStore.deleteStoreContact(msg.from);
    EaseConnKit.contactStore.addContactNotice(notice);
  }

  handleContactAdded(msg) {
    const notice = { ...msg, ext: "added", time: Date.now() };
    EaseConnKit.appUserStore.getUsersInfo({ userIdList: [msg.from] });
    EaseConnKit.contactStore.addStoreContact({ userId: msg.from, remark: "" });
    EaseConnKit.contactStore.addContactNotice(notice);
  }

  async handleGroupEvent(event) {
    GroupEventFromIds.push(event.from);

    if (["directJoined", "create", "acceptRequest"].includes(event.operation)) {
      const res = await EaseConnKit.groupStore.getGroupInfo(event.id);
      const info = res.data?.[0];
      if (info) {
        EaseConnKit.groupStore.setJoinedGroupList([
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
      EaseConnKit.groupStore.removeStoreGroup(event.id);
    }

    this._throttle();

    const isDuplicate = EaseConnKit.groupStore.groupNoticeInfo.list.some(
      (item) =>
        item.operation === "inviteToJoin" &&
        item.id === event.id &&
        item.showOperation === true
    );
    if (!isDuplicate) {
      EaseConnKit.groupStore.addGroupNotice({
        ...event,
        time: Date.now(),
        showOperation: event.operation === "inviteToJoin"
      });
    }

    const msg = EaseConnKit.connStore.getChatSDK().message.create({
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
    EaseConnKit.messageStore.insertNoticeMessage(msg);
  }
}

export default ChatStore;
