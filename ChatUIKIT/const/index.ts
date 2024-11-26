const GET_GROUP_MEMBERS_PAGESIZE = 100; // 获取群组成员列表的每页数量

const GroupEventFromIds: Array<string> = [];

const AT_ALL = "ALL";

const USER_AVATAR_URL = "https://img.yzcdn.cn/vant/cat.jpeg";

const GROUP_AVATAR_URL = "https://img.yzcdn.cn/2.jpg";

/** UIKIT 中支持的用户状态 */
const PRESENCE_STATUS_LIST = [
  "Online", // 在线
  "Offline", // 离线
  "Away", // 离开
  "Busy", // 忙碌
  "Do Not Disturb", // 请勿打扰
  "Custom" // 自定义
];

export {
  AT_ALL,
  GET_GROUP_MEMBERS_PAGESIZE,
  USER_AVATAR_URL,
  GROUP_AVATAR_URL,
  PRESENCE_STATUS_LIST,
  GroupEventFromIds
};
