import { makeAutoObservable } from "mobx";
import type { EasemobChat } from "easemob-websdk";
import { ChatUIKIT } from "../index";

class AppUserStore {
  appUserInfo: Map<string, EasemobChat.UpdateOwnUserInfoParams> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  /** 获取用户信息 */
  getUsersInfo(props: { userIdList: string[]; withPresence?: boolean }) {
    const { userIdList = [], withPresence = true } = props;
    return new Promise((resolve, reject) => {
      const type = [
        "nickname",
        "avatarurl",
        "mail",
        "phone",
        "gender",
        "sign",
        "birth",
        "ext"
      ] as EasemobChat.ConfigurableKey[];

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
              this.appUserInfo.set(key, result);
            });
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /** 更新用户信息 */
  updateUserInfo(params: EasemobChat.UpdateOwnUserInfoParams) {
    return ChatUIKIT.getChatConn()
      .updateUserInfo(params)
      .then((res) => {
        this.appUserInfo.set(ChatUIKIT.getChatConn().user, res.data || {});
        return res;
      });
  }

  /** 从Store中获取用户信息 */
  getUserInfoFromStore(userId: string) {
    const userInfo = this.appUserInfo.get(userId);
    return {
      name: userInfo?.nickname || userId,
      nickname: userInfo?.nickname,
      avatar: userInfo?.avatarurl || "",
      sign: userInfo?.sign || ""
    };
  }

  /** 获取当前用户信息 */
  getSelfUserInfo() {
    return this.getUserInfoFromStore(ChatUIKIT.getChatConn().user);
  }

  /** 清空用户信息 */
  clear() {
    this.appUserInfo.clear();
  }
}

export default AppUserStore;
