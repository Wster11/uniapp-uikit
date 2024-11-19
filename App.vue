<script lang="ts">
import { ChatUIKIT } from "./ChatUIKIT";
import { APPKEY, API_URL, URL, CHAT_STORE } from "@/const/index";
import websdk from "easemob-websdk/uniApp/Easemob-chat";
import { EasemobChatStatic } from "easemob-websdk/Easemob-chat";

const chat = new (websdk as unknown as EasemobChatStatic).connection({
  appKey: APPKEY,
  isHttpDNS: false,
  url: URL,
  apiUrl: API_URL,
  delivery: true
});

ChatUIKIT.init({
  chat,
  config: {
    theme: {
      avatarShape: "square"
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
      // inputImage: false,
      // inputAudio: false,
      // inputVideo: false,
      // inputMention: false
    }
  }
});

// 手动设置用户属性
// ChatUIKIT.appUserStore.addUserInfo("0c1bdd28c7", {
//   nickname: "张三",
//   avatarurl: "https://p9-passport.byteacctimg.com/img/user-avatar/6d239ae53c4aded5fadd95cda5fc6759~40x40.awebp"
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
      uni.reLaunch({
        url: "/ChatUIKIT/modules/Conversation/index",
        success: () => {
          // #ifdef APP-PLUS
          plus.navigator.closeSplashscreen();
          // #endif
        }
      });
      const { userId, token } = res.data;
      await uni.$UIKIT.chatStore.login({
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
  },
  onHide: function () {
    console.log("App Hide");
  }
};
</script>

<style>
@import url("./common.scss");
</style>
