import { makeAutoObservable } from "mobx";
import type { ContactNotice, ContactNoticeInfo, Chat } from "../types/index";
import { ChatUIKIT } from "../index";

class ContactStore {
  contacts: Chat.ContactItem[] = [];
  contactsNoticeInfo: ContactNoticeInfo = {
    list: [],
    unReadCount: 0
  };
  viewedUserInfo: Chat.ContactItem = {} as Chat.ContactItem;

  constructor() {
    makeAutoObservable(this);
  }

  /** 递归获取联系人信息 */
  deepGetUserInfo(userIdList: string[], pageNum: number = 1) {
    const pageSize = 100;
    const userIds = userIdList;
    const start = (pageNum - 1) * pageSize;
    const end = pageNum * pageSize;
    ChatUIKIT.appUserStore
      .getUsersInfoFromServer({
        userIdList: userIds.slice(start, end)
      })
      .then(() => {
        if (userIds.length > end) {
          this.deepGetUserInfo(userIds, pageNum + 1);
        }
      });
  }

  /** 获取全部联系人 */
  getContacts() {
    ChatUIKIT.getChatConn()
      .getAllContacts()
      .then((res) => {
        if (res.data) {
          this.deepGetUserInfo(res.data.map((item) => item.userId) || []);
          this.contacts = res.data;
        }
      });
  }

  /** 添加好友 */
  addContact(userId: string) {
    return ChatUIKIT.getChatConn()
      .addContact(userId, "apply join contact")
      .then((res) => {
        return res;
      });
  }

  /** 删除好友 */
  deleteContact(userId: string) {
    return ChatUIKIT.getChatConn()
      .deleteContact(userId)
      .then((res) => {
        this.deleteStoreContact(userId);
        return res;
      });
  }

  /** 拒绝好友申请 */
  declineContactInvite(userId: string) {
    return ChatUIKIT.getChatConn()
      .declineContactInvite(userId)
      .then((res) => {
        return res;
      });
  }

  /** 接受好友申请 */
  acceptContactInvite(userId: string) {
    return ChatUIKIT.getChatConn()
      .acceptContactInvite(userId)
      .then((res) => {
        this.deleteContactNotice(userId);
        return res;
      });
  }

  /** push 好友通知 */
  addContactNotice(msg: ContactNotice) {
    this.contactsNoticeInfo.list.unshift(msg);
    this.contactsNoticeInfo.unReadCount++;
  }

  /** 删除好友通知 */
  deleteContactNotice(userId: string) {
    const index = this.contactsNoticeInfo.list.findIndex(
      (item) => item.from === userId
    );
    if (index !== -1) {
      this.contactsNoticeInfo.list.splice(index, 1);
      this.contactsNoticeInfo.unReadCount--;
    }
  }

  /** 删除 store 中的联系人 */
  deleteStoreContact(userId: string) {
    const index = this.contacts.findIndex((item) => item.userId === userId);
    if (index !== -1) {
      this.contacts.splice(index, 1);
    }
  }

  /** 添加 store 的联系人 */
  addStoreContact(user: Chat.ContactItem) {
    if (!this.contacts.find((item) => item.userId === user.userId)) {
      this.contacts.unshift(user);
    }
  }

  setViewedUserInfo(user: Chat.ContactItem) {
    this.viewedUserInfo = user;
  }

  /** 设置联系人备注 */
  setContactRemark(userId: string, remark: string) {
    return ChatUIKIT.getChatConn()
      .setContactRemark({ userId, remark })
      .then((res) => {
        const index = this.contacts.findIndex((item) => item.userId === userId);
        if (index !== -1) {
          this.contacts[index].remark = remark;
        }
        return res;
      });
  }

  /** 清空联系人通知未读数 */
  clearContactNoticeUnReadCount() {
    this.contactsNoticeInfo.unReadCount = 0;
  }

  /** 清空联系人 Store */
  clear() {
    this.contacts = [];
    this.contactsNoticeInfo = { list: [], unReadCount: 0 };
    this.viewedUserInfo = {} as Chat.ContactItem;
  }
}

export default ContactStore;
