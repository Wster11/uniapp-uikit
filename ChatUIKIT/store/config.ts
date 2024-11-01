import { makeAutoObservable } from "mobx";
import { ChatUIKITConfig, FeatureConfig } from "../configType";

const DEFAULT_FEATURES_CONFIG: FeatureConfig = {
  pinConversation: true
};

class ConfigStore {
  /** UIKIT全局配置 */
  config: ChatUIKITConfig;
  constructor() {
    makeAutoObservable(this);
  }
  /** 初始化全局配置 */
  initConfig(config: ChatUIKITConfig) {
    this.config = config;
  }

  getConfig() {
    return this.config;
  }
  getFeatureConfig() {
    return {
      ...DEFAULT_FEATURES_CONFIG,
      ...(this.config.uikit.features || {})
    };
  }
}

export default ConfigStore;
