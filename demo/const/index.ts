const CHAT_STORE = "chat";
const SERVER_CONFIG_STORE = "serverConfig";

const serverConfig = uni.getStorageSync(SERVER_CONFIG_STORE) || {};
const IS_USE_CUSTOM_SERVER = serverConfig.isUseCustomServer || false; // 是否使用自定义服务器
const APPKEY = serverConfig.appkey || "your#appkey"; // 环信appkey
const API_URL = serverConfig.restUrl || ""; // 环信api地址
const URL = serverConfig.url || ""; // 环信websocket地址

// Demo内部上传头像地址 (仅支持官方appkey使用)
const getInsideUploadUrl = (userId: string) => {
  return `https://a1-appserver.easemob.com/inside/app/user/${userId}/avatar/upload`;
};

// Demo内部获取群头像地址 (仅支持官方appkey使用)
const getInsideGroupAvatarUrl = (groupId: string) => {
  return `https://a1-appserver.easemob.com/inside/app/group/${groupId}/avatarurl`;
};

export {
  CHAT_STORE,
  SERVER_CONFIG_STORE,
  APPKEY,
  API_URL,
  URL,
  IS_USE_CUSTOM_SERVER,
  getInsideUploadUrl,
  getInsideGroupAvatarUrl
};
