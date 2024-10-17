import { EasemobChat, EasemobChatStatic } from "easemob-websdk";
interface EaseUIKITConfig {
  sdk: EasemobChatStatic;
  sdkConfig: EasemobChat.ConnectionParameters;
  uikit: {
    features?: {};
    theme?: {
      // 头像形状
      avatarShape?: "circle" | "square";
    };
  };
}

export { EaseUIKITConfig };
