import { makeAutoObservable } from "mobx";
import type { Chat, PresenceInfo, UserInfoWithPresence } from "../types/index";
import { ChatUIKIT } from "../index";

/**
 * 用户信息和在线状态管理类
 */
class AppUserStore {
  /** 存储用户信息的映射表，key为用户ID，value为用户信息 */
  appUserInfo: Map<string, Chat.UpdateOwnUserInfoParams> = new Map();
  /** 存储用户在线状态的映射表，key为用户ID，value为在线状态信息 */
  appUserPresence: Map<string, PresenceInfo> = new Map();

  constructor() {
    console.log("[AppUserStore] Initializing...");
    makeAutoObservable(this);
  }

  /**
   * 从服务器获取用户属性信息
   * @param props 包含用户ID列表的对象
   * @returns Promise 返回用户信息获取的结果
   */
  getUsersInfoFromServer(props: { userIdList: string[] }) {
    const { userIdList = [] } = props;
    console.log("[AppUserStore] Getting users info from server for:", userIdList);
    
    if (ChatUIKIT.getFeatureConfig().useUserInfo === false) {
      console.log("[AppUserStore] User info feature is disabled");
      return Promise.resolve({});
    }

    if (userIdList.length === 0) {
      console.log("[AppUserStore] Empty user list, resolving");
      return Promise.resolve({});
    }

    const fetchUserIds = userIdList.filter(userId => !this.appUserInfo.has(userId));

    if (fetchUserIds.length === 0) {
      console.log("[AppUserStore] All users info already in cache");
      return Promise.resolve({});
    }

    return ChatUIKIT.getChatConn()
      .fetchUserInfoById(fetchUserIds)
      .then((res) => {
        console.log("[AppUserStore] Successfully fetched users info:", res);
        res.data &&
          Object.keys(res.data).forEach((key) => {
            const result = res.data?.[key] || {};
            this.setUserInfo(key, result);
          });
        return res;
      })
      .catch((e) => {
        console.error("[AppUserStore] Failed to fetch users info:", e);
        throw e;
      });
  }

  /**
   * 从服务器获取用户在线状态
   * @param props 包含用户ID列表的对象
   */
  getUsersPresenceFromServer(props: { userIdList: string[] }) {
    console.log("[AppUserStore] Getting users presence from server for:", props.userIdList);
    ChatUIKIT.getChatConn()
      .getPresenceStatus({ usernames: props.userIdList })
      .then((res) => {
        console.log("[AppUserStore] Successfully got presence status:", res);
        res?.data?.result.forEach((item: Chat.SubscribePresence) => {
          let isOnline = false;
          let ext = item.ext;
          if (
            item.status && typeof item.status === 'object' && !Array.isArray(item.status) &&
            Object.values(item.status).indexOf("1") > -1
          ) {
            isOnline = true;
          }
          this.setUserPresence(item.uid, {
            presenceExt: ext,
            isOnline
          });
        });
      })
      .catch((e) => {
        console.error("[AppUserStore] Failed to get presence status:", e);
      });
  }

  /**
   * 订阅指定用户的在线状态
   * @param props 包含用户ID列表的对象
   * @returns Promise 返回订阅操作的结果
   */
  subscribePresence(props: { userIdList: string[] }) {
    console.log("[AppUserStore] Subscribing to presence for users:", props.userIdList);
    return ChatUIKIT.getChatConn().subscribePresence({
      usernames: props.userIdList,
      expiry: 86400
    });
  }

  /**
   * 取消订阅指定用户的在线状态
   * @param props 包含用户ID列表的对象
   * @returns Promise 返回取消订阅操作的结果
   */
  unsubscribePresence(props: { userIdList: string[] }) {
    console.log("[AppUserStore] Unsubscribing from presence for users:", props.userIdList);
    return ChatUIKIT.getChatConn().unsubscribePresence({
      usernames: props.userIdList
    });
  }

  /**
   * 发布自定义在线状态
   * @param props 包含自定义在线状态信息的对象
   * @returns Promise 返回发布操作的结果
   */
  publishPresence(props: { presenceExt: string }) {
    console.log("[AppUserStore] Publishing presence with ext:", props.presenceExt);
    return ChatUIKIT.getChatConn().publishPresence({
      description: props.presenceExt
    });
  }

  /**
   * 设置用户属性信息
   * @param userId 用户ID
   * @param userInfo 用户信息对象
   */
  setUserInfo(userId: string, userInfo: Chat.UpdateOwnUserInfoParams) {
    console.log("[AppUserStore] Setting user info for:", userId, userInfo);
    this.appUserInfo.set(userId, userInfo);
  }

  /**
   * 更新用户属性信息
   * @param params 要更新的用户信息参数
   * @returns Promise 返回更新操作的结果
   */
  updateUserInfo(params: Chat.UpdateOwnUserInfoParams) {
    console.log("[AppUserStore] Updating user info:", params);
    return ChatUIKIT.getChatConn()
      .updateUserInfo(params)
      .then((res) => {
        console.log("[AppUserStore] Successfully updated user info:", res);
        this.setUserInfo(ChatUIKIT.getChatConn().user, res.data || {});
        return res;
      })
      .catch((e) => {
        console.error("[AppUserStore] Failed to update user info:", e);
        throw e;
      });
  }

  /**
   * 从Store中获取用户属性和在线状态信息
   * @param userId 用户ID
   * @returns 包含用户信息和在线状态的对象
   */
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

  /**
   * 获取当前用户的属性信息
   * @returns 当前用户的信息和在线状态
   */
  getSelfUserInfo() {
    return this.getUserInfoFromStore(ChatUIKIT.getChatConn().user);
  }

  /**
   * 设置用户在线状态
   * @param userId 用户ID
   * @param presence 在线状态信息
   */
  setUserPresence(userId: string, presence: PresenceInfo) {
    console.log("[AppUserStore] Setting presence for user:", userId, presence);
    this.appUserPresence.set(userId, presence);
  }

  /**
   * 从Store中获取用户在线状态
   * @param userId 用户ID
   * @returns 用户的在线状态信息
   */
  getUserPresenceFromStore(userId: string) {
    return this.appUserPresence.get(userId);
  }

  /**
   * 清空所有用户属性信息
   */
  clear() {
    console.log("[AppUserStore] Clearing all user info");
    this.appUserInfo.clear();
  }
}

export default AppUserStore;
