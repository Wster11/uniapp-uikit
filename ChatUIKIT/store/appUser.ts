import { makeAutoObservable } from "mobx";
import type { Chat } from "../types/index";
import { ChatUIKIT } from "../index";

class AppUserStore {
  appUserInfo: Map<string, Chat.UpdateOwnUserInfoParams> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  /** 获取用户属性 */
  getUsersInfo(props: { userIdList: string[]; withPresence?: boolean }) {
    const { userIdList = [], withPresence = true } = props;
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

  /** 从Store中获取用户属性 */
  getUserInfoFromStore(userId: string) {
    const userInfo = this.appUserInfo.get(userId);
    return {
      name: userInfo?.nickname || userId,
      nickname: userInfo?.nickname,
      avatar: userInfo?.avatarurl || "",
      sign: userInfo?.sign || ""
    };
  }

  /** 获取当前用户属性 */
  getSelfUserInfo() {
    return this.getUserInfoFromStore(ChatUIKIT.getChatConn().user);
  }

  /** 清空用户属性 */
  clear() {
    this.appUserInfo.clear();
  }
}

export default AppUserStore;
