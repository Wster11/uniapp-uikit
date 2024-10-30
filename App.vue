<script lang="ts">
import { EaseConnKit } from "./EaseUIKIT";
import { APPKEY, API_URL, URL, CHAT_STORE } from "@/const/index";
import websdk from "easemob-websdk/uniApp/Easemob-chat";
import { EasemobChatStatic } from "easemob-websdk/Easemob-chat";

EaseConnKit.init({
  sdk: websdk as unknown as EasemobChatStatic,
  sdkConfig: {
    appKey: APPKEY,
    isHttpDNS: false,
    url: URL,
    apiUrl: API_URL,
    delivery: true
  },
  uikit: {
    theme: {
      avatarShape: "square"
    }
  }
});

uni.$UIKIT = EaseConnKit;

// 获取IM实例
const conn = EaseConnKit.connStore.getChatConn();
/** 连接状态事件 */
// conn.addEventHandler("CONNECTION_STATE", {
//   onConnected: () => {
//     uni.showToast({
//       icon: "none",
//       title: "onConnected"
//     });
//   },
//   onDisconnected: () => {
//     uni.showToast({
//       icon: "none",
//       title: "onDisconnected"
//     });
//   },
//   //@ts-ignore
//   onReconnecting: () => {
//     uni.showToast({
//       icon: "none",
//       title: "onReconnecting"
//     });
//   },
//   onOnline: () => {
//     uni.showToast({
//       icon: "none",
//       title: "onOnline"
//     });
//   },
//   onOffline: () => {
//     uni.showToast({
//       icon: "none",
//       title: "onOffline"
//     });
//   }
// });

const autoLogin = async () => {
  try {
    let res = await uni.getStorage({
      key: CHAT_STORE
    });
    // 如果存在缓存，直接登录
    if (res.data) {
      // 跳转会话列表页面
      uni.switchTab({
        url: "/EaseUIKIT/modules/Conversation/index"
      });
      const { userId, token } = res.data;
      await uni.$UIKIT.chatStore.login({
        user: userId,
        accessToken: token
      });
    }
  } catch (error) {
    uni.redirectTo({
      url: "/pages/Login/index"
    });
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
  },
  onHide: function () {
    console.log("App Hide");
  }
};
</script>

<style>
@import url("./common.scss");
</style>
