import { EasemobChat, EasemobChatStatic } from "easemob-websdk";

interface FeatureConfig {
  // 是否开启置顶会话功能，默认开启
  pinConversation?: boolean;
}

interface EaseUIKITConfig {
  sdk: EasemobChatStatic;
  sdkConfig: EasemobChat.ConnectionParameters;
  uikit: {
    features?: FeatureConfig;
    theme?: {
      // 头像形状
      avatarShape?: "circle" | "square";
    };
  };
}

export { EaseUIKITConfig, FeatureConfig };
