import { makeAutoObservable, runInAction } from "mobx";
import type { GroupNotice, GroupNoticeInfo, Chat } from "../types/index";
import { GET_GROUP_MEMBERS_PAGESIZE } from "../const/index";
import { ChatUIKIT } from "../index";

class GroupStore {
  joinedGroupList: Chat.GroupInfo[] = [];
  groupDetailMap: Map<string, Chat.GroupDetailInfo> = new Map();
  groupAvatarMap: Map<string, string> = new Map();
  groupNoticeInfo: GroupNoticeInfo = {
    list: [],
    unReadCount: 0
  };
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
    ChatUIKIT.getChatConn()
      .getJoinedGroups(this.getJoinedGroupListParams)
      .then((res) => {
        if (res.entities) {
          this.setJoinedGroupList(res.entities as Chat.GroupInfo[]);
          if (res.entities.length >= this.getJoinedGroupListParams.pageSize) {
            this.getJoinedGroupListParams.pageNum++;
            this.getJoinedGroupList();
          }
        }
      });
  };

  setJoinedGroupList = (groups: Chat.GroupInfo[]) => {
    const currentGroupIds = this.joinedGroupList.map((item) => item.groupId);
    const filterJoinedGroups = groups.filter(
      ({ groupId }) => !currentGroupIds.includes(groupId)
    );

    this.joinedGroupList.push(...filterJoinedGroups);
  };

  applyJoinGroup = (groupId: string) => {
    return ChatUIKIT.getChatConn().joinGroup({
      groupId,
      message: "apply join group"
    });
  };

  createGroup = (params: any) => {
    return ChatUIKIT.getChatConn()
      .createGroup(params)
      .then((res) => {
        this.joinedGroupList.unshift({
          groupId: res?.data?.groupid || "",
          groupName: params.data.groupname,
          description: params.data.description,
          role: "owner",
          disabled: false,
          public: params.data.public
        } as Chat.GroupInfo);
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
    return ChatUIKIT.getChatConn()
      .destroyGroup({ groupId })
      .then((res) => {
        this.removeStoreGroup(groupId);
        return res;
      });
  };

  getGroupInfo = (groupId: string | string[]) => {
    return ChatUIKIT.getChatConn()
      .getGroupInfo({ groupId })
      .then((res) => {
        res.data?.forEach((info) => {
          this.groupDetailMap.set(info.id, info);
        });
        return res;
      });
  };

  addGroupNotice = (event: GroupNotice) => {
    this.groupNoticeInfo.list.unshift(event);
    this.groupNoticeInfo.unReadCount++;
  };

  inviteJoinGroup = (groupId: string, members: string[]) => {
    return ChatUIKIT.getChatConn().inviteUsersToGroup({
      groupId,
      users: members
    });
  };

  removeUserFromGroup = (groupId: string, members: string[]) => {
    return ChatUIKIT.getChatConn()
      .removeGroupMembers({ groupId, users: members })
      .then((res) => {
        this.removeStoreGroupUser(groupId, members);
        return res;
      });
  };

  getGroupMembers = (groupId: string, pageNum: number) => {
    return ChatUIKIT.getChatConn()
      .listGroupMembers({
        groupId,
        pageNum,
        pageSize: GET_GROUP_MEMBERS_PAGESIZE
      })
      .then((res) => {
        ChatUIKIT.appUserStore.getUsersInfoFromServer({
          userIdList: res.data.map((item) => item.member || item.owner) || []
        });
        return res;
      });
  };

  leaveGroup = (groupId: string) => {
    return ChatUIKIT.getChatConn()
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
    return ChatUIKIT.getChatConn()
      .acceptGroupInvite({
        invitee: ChatUIKIT.getChatConn().user,
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
    return ChatUIKIT.getChatConn().rejectGroupInvite({
      invitee: ChatUIKIT.getChatConn().user,
      groupId
    });
  };

  getGroupAvatar = (groupId: string) => {
    return this.groupAvatarMap.get(groupId) || "";
  };

  setGroupAvatar = (groupId: string, avatar: string) => {
    this.groupAvatarMap.set(groupId, avatar);
  };

  isHasGroupAvatar = (groupId: string) => {
    return this.groupAvatarMap.has(groupId);
  };

  clear = () => {
    runInAction(() => {
      this.getJoinedGroupListParams = {
        pageSize: 20, // 最大支持20
        pageNum: 0,
        needAffiliations: true,
        needRole: true
      };
      this.joinedGroupList = [];
      this.groupNoticeInfo = {
        list: [],
        unReadCount: 0
      };
      this.groupDetailMap.clear();
    });
  };
}

export default GroupStore;
