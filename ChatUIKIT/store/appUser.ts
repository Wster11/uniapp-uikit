import { makeAutoObservable } from "mobx";
import type { Chat, PresenceInfo, UserInfoWithPresence } from "../types/index";
import { ChatUIKIT } from "../index";

class AppUserStore {
  appUserInfo: Map<string, Chat.UpdateOwnUserInfoParams> = new Map();
  appUserPresence: Map<string, PresenceInfo> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  /** 获取用户属性 */
  getUsersInfoFromServer(props: { userIdList: string[] }) {
    const { userIdList = [] } = props;
    return new Promise((resolve, reject) => {
      if (ChatUIKIT.getFeatureConfig().useUserInfo === false) {
        resolve({});
        return;
      }
      const type = [
        "nickname",
        "avatarurl",
        "mail",
        "phone",
        "gender",
        "sign",
        "birth",
        "ext"
      ] as Chat.ConfigurableKey[];

      if (userIdList.length === 0) {
        resolve({});
        return;
      }

      const fetchUserIds = userIdList.filter((userId) => {
        return !this.appUserInfo.has(userId);
      });

      if (fetchUserIds.length === 0) {
        resolve({});
        return;
      }

      ChatUIKIT.getChatConn()
        .fetchUserInfoById(fetchUserIds, type)
        .then((res) => {
          res.data &&
            Object.keys(res.data).forEach((key) => {
              const result = res.data?.[key] || {};
              this.setUserInfo(key, result);
            });
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /** 获取用户presence */
  getUsersPresenceFromServer(props: { userIdList: string[] }) {
    ChatUIKIT.getChatConn()
      .getPresenceStatus({ usernames: props.userIdList })
      .then((res) => {
        let isOnline = false;
        res?.data?.result.forEach((item: Chat.SubscribePresence) => {
          let ext = item.ext;
          if (
            Object.prototype.toString.call(item.status) === "[object Object]" &&
            Object.values(item.status).indexOf("1") > -1
          ) {
            isOnline = true;
          }
          this.setUserPresence(item.uid, {
            presenceExt: ext,
            isOnline
          });
        });
      });
  }

  /** 订阅指定用户的在线状态 */
  subscribePresence(props: { userIdList: string[] }) {
    return ChatUIKIT.getChatConn().subscribePresence({
      usernames: props.userIdList,
      expiry: 86400
    });
  }

  /** 取消订阅指定用户的在线状态 */
  unsubscribePresence(props: { userIdList: string[] }) {
    return ChatUIKIT.getChatConn().unsubscribePresence({
      usernames: props.userIdList
    });
  }

  /** 发布自定义在线状态 */
  publishPresence(props: { presenceExt: string }) {
    return ChatUIKIT.getChatConn().publishPresence({
      description: props.presenceExt
    });
  }

  /** 设置用户属性 */
  setUserInfo(userId: string, userInfo: Chat.UpdateOwnUserInfoParams) {
    this.appUserInfo.set(userId, userInfo);
  }

  /** 更新用户属性 */
  updateUserInfo(params: Chat.UpdateOwnUserInfoParams) {
    return ChatUIKIT.getChatConn()
      .updateUserInfo(params)
      .then((res) => {
        this.setUserInfo(ChatUIKIT.getChatConn().user, res.data || {});
        return res;
      });
  }

  /** 从Store中获取用户属性和Presence */
  getUserInfoFromStore(userId: string): UserInfoWithPresence {
    const userInfo = this.appUserInfo.get(userId);
    const presenceInfo = this.getUserPresenceFromStore(userId);
    return {
      name: userInfo?.nickname || userId,
      nickname: userInfo?.nickname,
      avatar: userInfo?.avatarurl || "",
      sign: userInfo?.sign || "",
      presenceExt: presenceInfo?.presenceExt,
      isOnline: presenceInfo?.isOnline
    };
  }

  /** 获取当前用户属性 */
  getSelfUserInfo() {
    return this.getUserInfoFromStore(ChatUIKIT.getChatConn().user);
  }

  /** 设置用户presence */
  setUserPresence(userId: string, presence: PresenceInfo) {
    this.appUserPresence.set(userId, presence);
  }

  /** 获取用户presence */
  getUserPresenceFromStore(userId: string) {
    return this.appUserPresence.get(userId);
  }

  /** 清空用户属性 */
  clear() {
    this.appUserInfo.clear();
  }
}

export default AppUserStore;
