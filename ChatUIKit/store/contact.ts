import { makeAutoObservable } from "mobx";
import type { ContactNotice, ContactNoticeInfo, Chat } from "../types/index";
import { ChatUIKit } from "../index";
import { logger } from "../log";

/**
 * 联系人管理类
 * 负责管理联系人列表、好友申请通知等功能
 */
class ContactStore {
  /** 联系人列表 */
  contacts: Chat.ContactItem[] = [];
  /** 好友申请通知信息,包含通知列表和未读数 */
  contactsNoticeInfo: ContactNoticeInfo = {
    list: [],
    unReadCount: 0
  };
  /** 当前查看的用户信息 */
  viewedUserInfo: Chat.ContactItem = {} as Chat.ContactItem;

  /**
   * 构造函数
   * 初始化并使对象可观察
   */
  constructor() {
    logger.info("[ContactStore] Initializing...");
    makeAutoObservable(this);
  }

  /**
   * 递归获取联系人信息
   * @param userIdList 用户ID列表
   * @param pageNum 页码,默认为1
   */
  deepGetUserInfo(userIdList: string[], pageNum: number = 1) {
    logger.info("[ContactStore] Getting user info recursively for page:", pageNum);
    const pageSize = 100;
    const userIds = userIdList;
    const start = (pageNum - 1) * pageSize;
    const end = pageNum * pageSize;
    ChatUIKit.appUserStore
      .getUsersInfoFromServer({
        userIdList: userIds.slice(start, end)
      })
      .then(() => {
        if (userIds.length > end) {
          this.deepGetUserInfo(userIds, pageNum + 1);
        }
      });
  }

  /**
   * 获取全部联系人
   */
  getContacts() {
    logger.info("[ContactStore] Getting all contacts");
    ChatUIKit.getChatConn()
      .getAllContacts()
      .then((res) => {
        if (res.data) {
          this.deepGetUserInfo(res.data.map((item) => item.userId) || []);
          this.contacts = res.data;
          logger.info("[ContactStore] Successfully got contacts:", res.data.length);
        }
      });
  }

  /**
   * 添加好友
   * @param userId 用户ID
   * @returns Promise 添加结果
   */
  addContact(userId: string) {
    logger.info("[ContactStore] Adding contact:", userId);
    return ChatUIKit.getChatConn()
      .addContact(userId, "apply join contact")
      .then((res) => {
        logger.info("[ContactStore] Successfully added contact:", userId);
        return res;
      });
  }

  /**
   * 删除好友
   * @param userId 用户ID
   * @returns Promise 删除结果
   */
  deleteContact(userId: string) {
    logger.info("[ContactStore] Deleting contact:", userId);
    return ChatUIKit.getChatConn()
      .deleteContact(userId)
      .then((res) => {
        this.deleteStoreContact(userId);
        logger.info("[ContactStore] Successfully deleted contact:", userId);
        return res;
      });
  }

  /**
   * 拒绝好友申请
   * @param userId 用户ID
   * @returns Promise 拒绝结果
   */
  declineContactInvite(userId: string) {
    logger.info("[ContactStore] Declining contact invite from:", userId);
    return ChatUIKit.getChatConn()
      .declineContactInvite(userId)
      .then((res) => {
        logger.info("[ContactStore] Successfully declined contact invite from:", userId);
        return res;
      });
  }

  /**
   * 接受好友申请
   * @param userId 用户ID
   * @returns Promise 接受结果
   */
  acceptContactInvite(userId: string) {
    logger.info("[ContactStore] Accepting contact invite from:", userId);
    return ChatUIKit.getChatConn()
      .acceptContactInvite(userId)
      .then((res) => {
        this.deleteContactNotice(userId);
        logger.info("[ContactStore] Successfully accepted contact invite from:", userId);
        return res;
      });
  }

  /**
   * 添加好友通知
   * @param msg 通知消息
   */
  addContactNotice(msg: ContactNotice) {
    logger.info("[ContactStore] Adding contact notice:", msg);
    this.contactsNoticeInfo.list.unshift(msg);
    this.contactsNoticeInfo.unReadCount++;
  }

  /**
   * 删除好友通知
   * @param userId 用户ID
   */
  deleteContactNotice(userId: string) {
    logger.info("[ContactStore] Deleting contact notice for:", userId);
    const index = this.contactsNoticeInfo.list.findIndex(
      (item) => item.from === userId
    );
    if (index !== -1) {
      this.contactsNoticeInfo.list.splice(index, 1);
      this.contactsNoticeInfo.unReadCount--;
    }
  }

  /**
   * 从store中删除联系人
   * @param userId 用户ID
   */
  deleteStoreContact(userId: string) {
    logger.info("[ContactStore] Deleting contact from store:", userId);
    const index = this.contacts.findIndex((item) => item.userId === userId);
    if (index !== -1) {
      this.contacts.splice(index, 1);
    }
  }

  /**
   * 向store中添加联系人
   * @param user 联系人信息
   */
  addStoreContact(user: Chat.ContactItem) {
    logger.info("[ContactStore] Adding contact to store:", user);
    if (!this.contacts.find((item) => item.userId === user.userId)) {
      this.contacts.unshift(user);
    }
  }

  /**
   * 设置当前查看的用户信息
   * @param user 用户信息
   */
  setViewedUserInfo(user: Chat.ContactItem) {
    logger.info("[ContactStore] Setting viewed user info:", user);
    this.viewedUserInfo = user;
  }

  /**
   * 设置联系人备注
   * @param userId 用户ID
   * @param remark 备注内容
   * @returns Promise 设置结果
   */
  setContactRemark(userId: string, remark: string) {
    logger.info("[ContactStore] Setting contact remark for:", userId, remark);
    return ChatUIKit.getChatConn()
      .setContactRemark({ userId, remark })
      .then((res) => {
        const index = this.contacts.findIndex((item) => item.userId === userId);
        if (index !== -1) {
          this.contacts[index].remark = remark;
        }
        logger.info("[ContactStore] Successfully set contact remark for:", userId);
        return res;
      });
  }

  /**
   * 清空联系人通知未读数
   */
  clearContactNoticeUnReadCount() {
    logger.info("[ContactStore] Clearing contact notice unread count");
    this.contactsNoticeInfo.unReadCount = 0;
  }

  /**
   * 清空联系人Store
   */
  clear() {
    logger.info("[ContactStore] Clearing contact store");
    this.contacts = [];
    this.contactsNoticeInfo = { list: [], unReadCount: 0 };
    this.viewedUserInfo = {} as Chat.ContactItem;
  }
}

export default ContactStore;
