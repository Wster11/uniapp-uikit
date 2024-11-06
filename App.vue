<script lang="ts">
import { ChatUIKIT } from "./ChatUIKIT";
import { APPKEY, API_URL, URL, CHAT_STORE } from "@/const/index";
import websdk from "easemob-websdk/uniApp/Easemob-chat";
import { EasemobChatStatic } from "easemob-websdk/Easemob-chat";

ChatUIKIT.init({
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
      avatarShape: "circle"
    },
    features: {
      // useUserInfo: false,
      // muteConversation: false,
      // pinConversation: false,
      // deleteConversation: false,
      // messageStatus: false,
      // copyMessage: false,
      // deleteMessage: false,
      // recallMessage: false,
      // editMessage: false,
      // replyMessage: false,
      // inputEmoji: false,
      // InputImage: false,
      // inputAudio: false,
      // inputVideo: false,
      // InputMention: false
    }
  }
});

// 手动设置用户属性
// ChatUIKIT.appUserStore.addUserInfo("0c1bdd28c7", {
//   nickname: "小明",
//   avatarurl: "https://img.yzcdn.cn/vant/cat.jpeg"
// });

uni.$UIKIT = ChatUIKIT;

const autoLogin = async () => {
  try {
    let res = await uni.getStorage({
      key: CHAT_STORE
    });
    // 如果存在缓存，直接登录
    if (res.data) {
      // 跳转会话列表页面
      uni.switchTab({
        url: "/ChatUIKIT/modules/Conversation/index"
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
