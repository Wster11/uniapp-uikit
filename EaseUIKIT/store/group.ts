import { makeAutoObservable, runInAction } from "mobx";
import type { EasemobChat } from "easemob-websdk/Easemob-chat";
import type { GroupNotice, GroupNoticeInfo } from "../types/index";
import {
  DEFAULT_GROUP_MEMBER_COUNT,
  GET_GROUP_MEMBERS_PAGESIZE
} from "../const/index";
import { EaseConnKit } from "../index";

class GroupStore {
  joinedGroupList: EasemobChat.GroupInfo[] = [];
  groupDetailMap: Map<string, EasemobChat.GroupDetailInfo> = new Map();
  groupNoticeInfo: GroupNoticeInfo = {
    list: [],
    unReadCount: 0
  };
  viewedGroupInfo: EasemobChat.GroupInfo = {} as EasemobChat.GroupInfo;
  isJoinedGroupListLast: boolean = true;
  getJoinedGroupListParams = {
    pageSize: 20, // 最大支持20
    pageNum: 0,
    needAffiliations: true,
    needRole: true
  };

  constructor() {
    makeAutoObservable(this);
  }

  getJoinedGroupList = () => {
    EaseConnKit.getChatConn()
      .getJoinedGroups(this.getJoinedGroupListParams)
      .then((res) => {
        if (res.entities) {
          this.setJoinedGroupList(res.entities as EasemobChat.GroupInfo[]);
          if (res.entities.length < this.getJoinedGroupListParams.pageSize) {
            this.isJoinedGroupListLast = true;
          } else {
            this.getJoinedGroupListParams.pageNum++;
            this.getJoinedGroupList();
          }
        }
      });
  };

  setJoinedGroupList = (groups: EasemobChat.GroupInfo[]) => {
    const currentGroupIds = this.joinedGroupList.map((item) => item.groupId);
    const filterJoinedGroups = groups.filter(
      ({ groupId }) => !currentGroupIds.includes(groupId)
    );

    this.joinedGroupList.push(...filterJoinedGroups);
  };

  applyJoinGroup = (groupId: string) => {
    return EaseConnKit.getChatConn().joinGroup({
      groupId,
      message: "apply join group"
    });
  };

  createGroup = (params: any) => {
    return EaseConnKit.getChatConn()
      .createGroup(params)
      .then((res) => {
        this.joinedGroupList.unshift({
          groupId: res?.data?.groupid || "",
          groupName: params.data.groupname,
          role: "owner",
          disabled: false,
          public: params.data.public
        } as EasemobChat.GroupInfo);
        return res;
      });
  };

  removeStoreGroup = (groupId: string) => {
    this.joinedGroupList = this.joinedGroupList.filter(
      (group) => group.groupId !== groupId
    );
  };

  removeStoreGroupUser = (groupId: string, userIds: string[]) => {
    const group = this.groupDetailMap.get(groupId);
    if (group) {
      group.affiliations = group.affiliations.filter((affiliation) => {
        return !userIds.includes(affiliation.member || affiliation.owner);
      });
      group.affiliations_count -= userIds.length;
      this.groupDetailMap.set(groupId, group);
    }
  };

  destroyGroup = (groupId: string) => {
    return EaseConnKit.getChatConn()
      .destroyGroup({ groupId })
      .then((res) => {
        this.removeStoreGroup(groupId);
        return res;
      });
  };

  getGroupInfo = (groupId: string | string[]) => {
    return EaseConnKit.getChatConn()
      .getGroupInfo({ groupId })
      .then((res) => {
        res.data?.forEach((info) => {
          this.groupDetailMap.set(info.id, info);
          const userIdList = info.affiliations
            .map((affiliation) => affiliation.member || affiliation.owner)
            .slice(0, DEFAULT_GROUP_MEMBER_COUNT);
          EaseConnKit.appUserStore.getUsersInfo({ userIdList });
        });
        return res;
      });
  };

  addGroupNotice = (event: GroupNotice) => {
    this.groupNoticeInfo.list.unshift(event);
    this.groupNoticeInfo.unReadCount++;
  };

  setViewedGroupInfo = (group: EasemobChat.GroupInfo) => {
    this.viewedGroupInfo = group;
  };

  inviteJoinGroup = (groupId: string, members: string[]) => {
    return EaseConnKit.getChatConn().inviteUsersToGroup({
      groupId,
      users: members
    });
  };

  removeUserFromGroup = (groupId: string, members: string[]) => {
    return EaseConnKit.getChatConn()
      .removeGroupMembers({ groupId, users: members })
      .then((res) => {
        this.removeStoreGroupUser(groupId, members);
        return res;
      });
  };

  getGroupMembers = (groupId: string, pageNum: number) => {
    return EaseConnKit.getChatConn()
      .listGroupMembers({
        groupId,
        pageNum,
        pageSize: GET_GROUP_MEMBERS_PAGESIZE
      })
      .then((res) => {
        EaseConnKit.appUserStore.getUsersInfo({
          userIdList: res.data.map((item) => item.member || item.owner) || []
        });
        return res;
      });
  };

  leaveGroup = (groupId: string) => {
    return EaseConnKit.getChatConn()
      .leaveGroup({ groupId })
      .then((res) => {
        this.removeStoreGroup(groupId);
        return res;
      });
  };

  getGroupInfoFromStore = (groupId: string) => {
    return this.joinedGroupList.find((group) => group.groupId === groupId);
  };

  clearGroupNoticeUnReadCount = () => {
    this.groupNoticeInfo.unReadCount = 0;
  };

  acceptGroupInvite = (groupId: string) => {
    return EaseConnKit.getChatConn()
      .acceptGroupInvite({
        invitee: EaseConnKit.getChatConn().user,
        groupId
      })
      .then(async () => {
        const res = await this.getGroupInfo(groupId);
        const info = res.data?.[0];
        if (info) {
          this.setJoinedGroupList([
            {
              groupId: info.id,
              groupName: info.name,
              public: info.public,
              description: info.description,
              disabled: true,
              allowInvites: info.allowinvites,
              maxUsers: info.maxusers,
              approval: info.membersonly
            }
          ]);
        }
      });
  };

  rejectGroupInvite = (groupId: string) => {
    return EaseConnKit.getChatConn().rejectGroupInvite({
      invitee: EaseConnKit.getChatConn().user,
      groupId
    });
  };

  clear = () => {
    runInAction(() => {
      this.joinedGroupList = [];
      this.groupNoticeInfo = {
        list: [],
        unReadCount: 0
      };
      this.groupDetailMap.clear();
      this.viewedGroupInfo = {} as EasemobChat.GroupInfo;
    });
  };
}

export default GroupStore;
