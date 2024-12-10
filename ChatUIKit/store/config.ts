import { makeAutoObservable } from "mobx";
import type {
  ChatUIKitConfig,
  ThemeConfig,
  FeatureConfig
} from "../configType";

/**
 * 配置管理类
 * 负责管理UI组件库的全局配置、主题配置和功能配置
 */
class ConfigStore {
  /** UIKIT全局配置对象 */
  config: ChatUIKitConfig;

  /**
   * 构造函数
   * 初始化默认配置并使对象可观察
   */
  constructor() {
    this.config = {
      features: {
        useUserInfo: true, // 是否使用用户属性功能
        muteConversation: true, // 是否使用免打扰
        pinConversation: true, // 是否允许会话置顶
        deleteConversation: true, // 是否允许删除会话
        messageStatus: true, // 是否显示消息状态
        copyMessage: true, // 是否允许复制消息
        deleteMessage: true, // 是否允许删除消息
        recallMessage: true, // 是否允许撤回消息
        editMessage: true, // 是否允许编辑消息
        replyMessage: true, // 是否允许回复消息
        inputEmoji: true, // 是否允许输入表情
        inputImage: true, // 是否允许发送图片
        inputAudio: true, // 是否允许发送语音
        inputVideo: true, // 是否允许发送视频
        inputFile: true, // 是否允许发送文件
        inputMention: true, // 是否允许@功能
        userCard: false, // 是否支持用户名片
        usePresence: true // 是否使用在线状态功能
      },
      theme: {
        avatarShape: "square" // 头像形状配置
      }
    };
    makeAutoObservable(this);
  }

  /**
   * 设置主题配置
   * @param config 主题配置对象
   */
  setThemeConfig(config: ThemeConfig) {
    this.config.theme = config;
  }

  /**
   * 获取全局配置
   * @returns 完整的配置对象
   */
  getConfig() {
    return this.config;
  }

  /**
   * 获取主题配置
   * @returns 主题配置对象
   */
  getThemeConfig() {
    return this.config.theme;
  }

  /**
   * 获取功能配置
   * @returns 功能配置对象
   */
  getFeatureConfig() {
    return this.config.features;
  }

  /**
   * 隐藏指定的UIKIT功能
   * @param features 要隐藏的功能键数组
   */
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
