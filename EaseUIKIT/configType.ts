import { EasemobChat } from "easemob-websdk";
interface EaseUIKITConfig {
  sdkConfig: EasemobChat.ConnectionParameters;
  features?: {};
  theme?: {
    // 头像形状
    avatarShape?: "circle" | "square";
  };
}

export { EaseUIKITConfig };
