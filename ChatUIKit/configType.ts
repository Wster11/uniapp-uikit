import { Chat } from "./types";

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
  /** 是否开启表情消息 */
  inputEmoji?: boolean;
  /** 是否开启图片消息 */
  inputImage?: boolean;
  /** 是否开启语音消息 */
  inputAudio?: boolean;
  /** 是否开启视频消息 */
  inputVideo?: boolean;
  /** 是否开启文件消息, 目前支有h5和小程序开启发送文件消息 */
  inputFile?: boolean;
  /** 是否开启Mention消息 */
  inputMention?: boolean;
  /** 是否开启名片消息 */
  userCard?: boolean;
  /** 是否开启Presence */
  usePresence?: boolean;
}

interface ThemeConfig {
  /** 头像形状 */
  avatarShape?: "circle" | "square";
}

/** UIKIT Config */
interface ChatUIKitConfig {
  /** UIKIT功能配置 */
  features: FeatureConfig;
  /** UIKIT 主题配置 */
  theme: ThemeConfig;
}

interface ChatUIKitInitParams {
  /** IM SDK实例 */
  chat: Chat.Connection;
  /** UIKIT init Config */
  config: {
    /** 主题配置 */
    theme: ThemeConfig;
    /** 是否开启调试模式 */
    isDebug: boolean;
  };
}

export { ChatUIKitInitParams, ChatUIKitConfig, FeatureConfig, ThemeConfig };
