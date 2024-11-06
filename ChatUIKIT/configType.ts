import { ChatSDK, ChatSDKStatic } from "./types";

interface FeatureConfig {
  /** 是否使用SDK的用户属性 */
  useUserInfo?: boolean;
  /** 是否启用会话免打扰 */
  muteConversation?: boolean;
  /** 是否开启置顶会话功能*/
  pinConversation?: boolean;
  /** 是否开启删除会话功能*/
  deleteConversation?: boolean;
  /** 是否展示消息状态 */
  messageStatus?: boolean;
  /** 是否开启复制消息 */
  copyMessage?: boolean;
  /** 是否开启删除消息 */
  deleteMessage?: boolean;
  /** 是否开启撤回消息 */
  recallMessage?: boolean;
  /** 是否开启编辑消息 */
  editMessage?: boolean;
  /** 是否开启回复消息 */
  replyMessage?: boolean;
  /** 是否支持表情消息 */
  inputEmoji?: boolean;
  /** 是否支持图片消息 */
  InputImage?: boolean;
  /** 是否支持语音消息 */
  inputAudio?: boolean;
  /** 是否支持视频消息 */
  inputVideo?: boolean;
  /** 是否支持Mention消息 */
  InputMention?: boolean;
}

interface ThemeConfig {
  /** 头像形状 */
  avatarShape?: "circle" | "square";
}

interface ChatUIKITConfig {
  sdk: ChatSDKStatic;
  sdkConfig: ChatSDK.ConnectionParameters;
  uikit: {
    features?: FeatureConfig;
    theme?: ThemeConfig;
  };
}

export { ChatUIKITConfig, FeatureConfig, ThemeConfig };
