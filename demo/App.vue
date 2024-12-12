<script lang="ts">
import { ChatUIKit } from "./ChatUIKit";
import {
  APPKEY,
  API_URL,
  URL,
  CHAT_STORE,
  getInsideGroupAvatarUrl
} from "@/const/index";
import websdk from "easemob-websdk/uniApp/Easemob-chat";
import { EasemobChatStatic } from "easemob-websdk/Easemob-chat";
import { autorun, runInAction } from "mobx";

const chat = new (websdk as unknown as EasemobChatStatic).connection({
  appKey: APPKEY,
  isHttpDNS: false,
  url: URL,
  apiUrl: API_URL,
  delivery: true
});

websdk.logger.disableAll();

ChatUIKit.init({
  chat,
  config: {
    theme: {
      avatarShape: "square"
    },
    isDebug: true
  }
});

// ChatUIKit.hideFeature(["useUserInfo", "usePresence"]);

// 手动设置用户属性
// ChatUIKit.appUserStore.setUserInfo("0c1bdd28c7", {
//   nickname: "张三",
//   avatarurl: "https://p9-passport.byteacctimg.com/img/user-avatar/6d239ae53c4aded5fadd95cda5fc6759~40x40.awebp"
// });

uni.$UIKit = ChatUIKit;

// 监听群组变化获取群组头像
autorun(() => {
  const groupIds = ChatUIKit.groupStore.joinedGroupList
    .filter((group) => {
      // 过滤掉已经有头像的群组
      return !ChatUIKit.groupStore.isHasGroupAvatar(group.groupId);
    })
    .map((group) => {
      // 设置头像空头像, 避免重复请求
      ChatUIKit.groupStore.setGroupAvatar(group.groupId, "");
      return group.groupId;
    });

  if (groupIds.length > 0) {
    getGroupAvatarUrl(groupIds);
  }
});

// 获取群组头像
const getGroupAvatarUrl = async (groupIds: string[]) => {
  for (let groupId of groupIds) {
    try {
      const res = await uni.request({
        url: getInsideGroupAvatarUrl(groupId),
        header: {
          Authorization: "Bearer " + ChatUIKit.getChatConn().accessToken
        }
      });
      runInAction(() => {
        // 设置群组头像
        ChatUIKit.groupStore.setGroupAvatar(groupId, res.data.avatarUrl);
      });
    } catch (error) {
      console.error("Failed to fetch group avatar:", groupId, error);
    }
  }
};

const autoLogin = async () => {
  try {
    let res = await uni.getStorage({
      key: CHAT_STORE
    });
    // 如果存在缓存，直接登录
    if (res.data) {
      // 跳转会话列表页面
      uni.reLaunch({
        url: "/ChatUIKit/modules/Conversation/index",
        success: () => {
          // #ifdef APP-PLUS
          plus.navigator.closeSplashscreen();
          // #endif
        }
      });
      const { userId, token } = res.data;
      await uni.$UIKit.chatStore.login({
        user: userId,
        accessToken: token
      });
    }
  } catch (error) {
    // #ifdef APP-PLUS
    plus.navigator.closeSplashscreen();
    // #endif
    console.log(error, "error");
  }
};

export default {
  onLaunch: function () {
    console.log("App Launch");
    autoLogin();
  },
  onShow: function () {
    console.log("App Show");
    ChatUIKit.onShow();
  },
  onHide: function () {
    console.log("App Hide");
  }
};
</script>

<style>
@import url("./common.scss");
</style>
