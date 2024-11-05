import { ChatSDK, ChatSDKStatic } from "./types";

interface FeatureConfig {
  // 是否开启置顶会话功能，默认开启
  pinConversation?: boolean;
}

interface ChatUIKITConfig {
  sdk: ChatSDKStatic;
  sdkConfig: ChatSDK.ConnectionParameters;
  uikit: {
    features?: FeatureConfig;
    theme?: {
      // 头像形状
      avatarShape?: "circle" | "square";
    };
  };
}

export { ChatUIKITConfig, FeatureConfig };
