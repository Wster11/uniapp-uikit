import { FeatureConfig, ThemeConfig } from "../configType";
const DEFAULT_GROUP_MEMBER_COUNT = 3; // 群组详情默认获取群成员详情的数量

const GET_GROUP_MEMBERS_PAGESIZE = 100; // 获取群组成员列表的每页数量

const GroupEventFromIds: Array<string> = [];

const AT_ALL = "ALL";

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  avatarShape: "circle"
};

const DEFAULT_FEATURES_CONFIG: FeatureConfig = {
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
  userCard: true
};

const USER_AVATAR_URL = "https://img.yzcdn.cn/vant/cat.jpeg";

const GROUP_AVATAR_URL = "https://img.yzcdn.cn/2.jpg";

export {
  AT_ALL,
  DEFAULT_THEME_CONFIG,
  DEFAULT_FEATURES_CONFIG,
  DEFAULT_GROUP_MEMBER_COUNT,
  GET_GROUP_MEMBERS_PAGESIZE,
  USER_AVATAR_URL,
  GROUP_AVATAR_URL,
  GroupEventFromIds
};
