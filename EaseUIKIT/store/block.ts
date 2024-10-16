import { makeAutoObservable } from "mobx";
import { EaseConnKit } from "../index";

class BlockStore {
  blockList: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  /** 获取黑名单列表 */
  getBlockList() {
    EaseConnKit.getChatConn()
      .getBlocklist()
      .then((res) => {
        this.blockList = res.data || [];
      });
  }

  /** 将用户加入黑名单 */
  blockUser(userId: string) {
    return EaseConnKit.getChatConn()
      .addUsersToBlocklist({
        name: userId
      })
      .then((res) => {
        this.blockList.unshift(userId);
        return res;
      });
  }

  /** 将用户移除黑名单 */
  unBlockUser(userId: string) {
    return EaseConnKit.getChatConn()
      .removeUserFromBlocklist({
        name: userId
      })
      .then((res) => {
        const index = this.blockList.findIndex((item) => item === userId);
        if (index !== -1) {
          this.blockList.splice(index, 1);
        }
        return res;
      });
  }

  /** 清空黑名单列表 */
  clear() {
    this.blockList = [];
  }
}

export default BlockStore;
