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
  InputImage: true,
  inputAudio: true,
  inputVideo: true,
  InputMention: true
};

export {
  AT_ALL,
  DEFAULT_THEME_CONFIG,
  DEFAULT_FEATURES_CONFIG,
  DEFAULT_GROUP_MEMBER_COUNT,
  GET_GROUP_MEMBERS_PAGESIZE,
  GroupEventFromIds
};
