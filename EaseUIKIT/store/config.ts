import { makeAutoObservable } from "mobx";
import { EaseUIKITConfig, FeatureConfig } from "../configType";

const DEFAULT_FEATURES_CONFIG: FeatureConfig = {
  pinConversation: true
};

class ConfigStore {
  /** UIKIT全局配置 */
  config: EaseUIKITConfig;
  constructor() {
    makeAutoObservable(this);
  }
  /** 初始化全局配置 */
  initConfig(config: EaseUIKITConfig) {
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
