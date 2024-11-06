import { makeAutoObservable } from "mobx";
import type { ChatUIKITConfig } from "../configType";
import { DEFAULT_FEATURES_CONFIG, DEFAULT_THEME_CONFIG } from "../const/index";

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
  /** 获取全局配置 */
  getConfig() {
    return this.config;
  }
  /** 获取主题配置 */
  getThemeConfig() {
    return {
      ...DEFAULT_THEME_CONFIG,
      ...(this.config.uikit.theme || {})
    };
  }
  /** 获取功能配置 */
  getFeatureConfig() {
    return {
      ...DEFAULT_FEATURES_CONFIG,
      ...(this.config.uikit.features || {})
    };
  }
}

export default ConfigStore;
