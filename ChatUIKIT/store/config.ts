import { makeAutoObservable } from "mobx";
import type {
  ChatUIKITConfig,
  ThemeConfig,
  FeatureConfig
} from "../configType";

class ConfigStore {
  /** UIKIT全局配置 */
  config: ChatUIKITConfig;
  constructor() {
    this.config = {
      features: {
        useUserInfo: true,
        muteConversation: true,
        pinConversation: true,
        deleteConversation: true,
        messageStatus: true,
        copyMessage: true,
        deleteMessage: true,
        recallMessage: true,
        editMessage: true,
        replyMessage: true,
        inputEmoji: true,
        inputImage: true,
        inputAudio: true,
        inputVideo: true,
        inputFile: true,
        inputMention: true,
        userCard: true,
        usePresence: true
      },
      theme: {
        avatarShape: "square"
      }
    };
    makeAutoObservable(this);
  }
  /** 设置化主题配置 */
  setThemeConfig(config: ThemeConfig) {
    this.config.theme = config;
  }
  /** 获取全局配置 */
  getConfig() {
    return this.config;
  }
  /** 获取主题配置 */
  getThemeConfig() {
    return this.config.theme;
  }
  /** 获取功能配置 */
  getFeatureConfig() {
    return this.config.features;
  }
  /** 隐藏UIKIT功能 */
  hideFeature(features: Array<keyof FeatureConfig>) {
    if (!features || !features.length) {
      return;
    }
    features.forEach((feature) => {
      if (this.config.features[feature]) {
        this.config.features[feature] = false;
      }
    });
  }
}

export default ConfigStore;
