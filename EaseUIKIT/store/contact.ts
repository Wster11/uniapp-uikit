import { makeAutoObservable } from "mobx";
import type { EasemobChat } from "easemob-websdk/Easemob-chat";
import type { ContactNotice, ContactNoticeInfo } from "../types/index";
import { EaseConnKit } from "../index";

class ContactStore {
  contacts: EasemobChat.ContactItem[] = [];
  contactsNoticeInfo: ContactNoticeInfo = {
    list: [],
    unReadCount: 0
  };
  viewedUserInfo: EasemobChat.ContactItem = {} as EasemobChat.ContactItem;

  constructor() {
    makeAutoObservable(this);
  }

  /** 递归获取联系人信息 */
  deepGetUserInfo(userIdList: string[], pageNum: number = 1) {
    const pageSize = 100;
    const userIds = userIdList;
    const start = (pageNum - 1) * pageSize;
    const end = pageNum * pageSize;
    EaseConnKit.appUserStore
      .getUsersInfo({
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
    EaseConnKit.getChatConn()
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
    return EaseConnKit.getChatConn()
      .addContact(userId, "apply join contact")
      .then((res) => {
        return res;
      });
  }

  /** 删除好友 */
  deleteContact(userId: string) {
    return EaseConnKit.getChatConn()
      .deleteContact(userId)
      .then((res) => {
        this.deleteStoreContact(userId);
        return res;
      });
  }

  /** 拒绝好友申请 */
  declineContactInvite(userId: string) {
    return EaseConnKit.getChatConn()
      .declineContactInvite(userId)
      .then((res) => {
        return res;
      });
  }

  /** 接受好友申请 */
  acceptContactInvite(userId: string) {
    return EaseConnKit.getChatConn()
      .acceptContactInvite(userId)
      .then((res) => {
        return res;
      });
  }

  /** push 好友通知 */
  addContactNotice(msg: ContactNotice) {
    this.contactsNoticeInfo.list.unshift(msg);
    this.contactsNoticeInfo.unReadCount++;
  }

  /** 删除 store 中的联系人 */
  deleteStoreContact(userId: string) {
    const index = this.contacts.findIndex((item) => item.userId === userId);
    if (index !== -1) {
      this.contacts.splice(index, 1);
    }
  }

  /** 添加 store 的联系人 */
  addStoreContact(user: EasemobChat.ContactItem) {
    if (!this.contacts.find((item) => item.userId === user.userId)) {
      this.contacts.unshift(user);
    }
  }

  setViewedUserInfo(user: EasemobChat.ContactItem) {
    this.viewedUserInfo = user;
  }

  /** 设置联系人备注 */
  setContactRemark(userId: string, remark: string) {
    return EaseConnKit.getChatConn()
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
    this.viewedUserInfo = {} as EasemobChat.ContactItem;
  }
}

export default ContactStore;
