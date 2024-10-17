import { makeAutoObservable } from "mobx";
import { EaseUIKITConfig } from "../configType";

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

  /** 获取全局配置 */
  getConfig() {
    return this.config;
  }
}

export default ConfigStore;
