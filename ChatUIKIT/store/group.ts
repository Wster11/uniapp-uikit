import { makeAutoObservable, runInAction } from "mobx";
import type { GroupNotice, GroupNoticeInfo, Chat } from "../types/index";
import { GET_GROUP_MEMBERS_PAGESIZE } from "../const/index";
import { ChatUIKIT } from "../index";

/**
 * 群组管理类
 * 负责管理群组列表、群组详情、群组通知等功能
 */
class GroupStore {
  /** 已加入的群组列表 */
  joinedGroupList: Chat.GroupInfo[] = [];
  /** 群组详情映射表 */
  groupDetailMap: Map<string, Chat.GroupDetailInfo> = new Map();
  /** 群组头像映射表 */
  groupAvatarMap: Map<string, string> = new Map();
  /** 群组通知信息,包含通知列表和未读数 */
  groupNoticeInfo: GroupNoticeInfo = {
    list: [],
    unReadCount: 0
  };
  /** 获取已加入群组列表的参数 */
  getJoinedGroupListParams = {
    pageSize: 20, // 最大支持20
    pageNum: 0,
    needAffiliations: true,
    needRole: true
  };

  /**
   * 构造函数
   * 初始化并使对象可观察
   */
  constructor() {
    console.log("[GroupStore] Initializing...");
    makeAutoObservable(this);
  }

  /**
   * 获取已加入的群组列表
   */
  getJoinedGroupList = () => {
    console.log("[GroupStore] Getting joined group list, page:", this.getJoinedGroupListParams.pageNum);
    ChatUIKIT.getChatConn()
      .getJoinedGroups(this.getJoinedGroupListParams)
      .then((res) => {
        if (res.entities) {
          console.log("[GroupStore] Received", res.entities.length, "groups");
          this.setJoinedGroupList(res.entities as Chat.GroupInfo[]);
          if (res.entities.length >= this.getJoinedGroupListParams.pageSize) {
            this.getJoinedGroupListParams.pageNum++;
            this.getJoinedGroupList();
          }
        }
      });
  };

  /**
   * 设置已加入的群组列表
   * @param groups 群组列表
   */
  setJoinedGroupList = (groups: Chat.GroupInfo[]) => {
    console.log("[GroupStore] Setting joined group list, count:", groups.length);
    const currentGroupIds = this.joinedGroupList.map((item) => item.groupId);
    const filterJoinedGroups = groups.filter(
      ({ groupId }) => !currentGroupIds.includes(groupId)
    );

    this.joinedGroupList.push(...filterJoinedGroups);
    console.log("[GroupStore] Added", filterJoinedGroups.length, "new groups");
  };

  /**
   * 申请加入群组
   * @param groupId 群组ID
   */
  applyJoinGroup = (groupId: string) => {
    console.log("[GroupStore] Applying to join group:", groupId);
    return ChatUIKIT.getChatConn().joinGroup({
      groupId,
      message: "apply join group"
    });
  };

  /**
   * 创建群组
   * @param params 创建群组参数
   */
  createGroup = (params: any) => {
    console.log("[GroupStore] Creating new group with params:", params);
    return ChatUIKIT.getChatConn()
      .createGroup(params)
      .then((res) => {
        const groupId = res?.data?.groupid || "";
        console.log("[GroupStore] Group created with ID:", groupId);
        this.joinedGroupList.unshift({
          groupId: groupId,
          groupName: params.data.groupname,
          description: params.data.description,
          role: "owner",
          disabled: false,
          public: params.data.public
        } as Chat.GroupInfo);
        return res;
      });
  };

  /**
   * 从store中移除群组
   * @param groupId 群组ID
   */
  removeStoreGroup = (groupId: string) => {
    console.log("[GroupStore] Removing group from store:", groupId);
    this.joinedGroupList = this.joinedGroupList.filter(
      (group) => group.groupId !== groupId
    );
  };

  /**
   * 从store中移除群组成员
   * @param groupId 群组ID
   * @param userIds 用户ID列表
   */
  removeStoreGroupUser = (groupId: string, userIds: string[]) => {
    console.log("[GroupStore] Removing users from group:", groupId, userIds);
    const group = this.groupDetailMap.get(groupId);
    if (group) {
      group.affiliations = group.affiliations.filter((affiliation) => {
        return !userIds.includes(affiliation.member || affiliation.owner);
      });
      group.affiliations_count -= userIds.length;
      this.groupDetailMap.set(groupId, group);
      console.log("[GroupStore] Updated group affiliations count:", group.affiliations_count);
    }
  };

  /**
   * 解散群组
   * @param groupId 群组ID
   */
  destroyGroup = (groupId: string) => {
    console.log("[GroupStore] Destroying group:", groupId);
    return ChatUIKIT.getChatConn()
      .destroyGroup({ groupId })
      .then((res) => {
        this.removeStoreGroup(groupId);
        console.log("[GroupStore] Group destroyed successfully");
        return res;
      });
  };

  /**
   * 获取群组信息
   * @param groupId 群组ID或ID列表
   */
  getGroupInfo = (groupId: string | string[]) => {
    console.log("[GroupStore] Getting group info for:", groupId);
    return ChatUIKIT.getChatConn()
      .getGroupInfo({ groupId })
      .then((res) => {
        res.data?.forEach((info) => {
          console.log("[GroupStore] Updating group info for:", info.id);
          this.groupDetailMap.set(info.id, info);
        });
        return res;
      });
  };

  /**
   * 添加群组通知
   * @param event 群组通知事件
   */
  addGroupNotice = (event: GroupNotice) => {
    console.log("[GroupStore] Adding group notice:", event);
    this.groupNoticeInfo.list.unshift(event);
    this.groupNoticeInfo.unReadCount++;
  };

  /**
   * 邀请用户加入群组
   * @param groupId 群组ID
   * @param members 成员列表
   */
  inviteJoinGroup = (groupId: string, members: string[]) => {
    console.log("[GroupStore] Inviting users to group:", groupId, members);
    return ChatUIKIT.getChatConn().inviteUsersToGroup({
      groupId,
      users: members
    });
  };

  /**
   * 将用户从群组中移除
   * @param groupId 群组ID
   * @param members 成员列表
   */
  removeUserFromGroup = (groupId: string, members: string[]) => {
    console.log("[GroupStore] Removing users from group:", groupId, members);
    return ChatUIKIT.getChatConn()
      .removeGroupMembers({ groupId, users: members })
      .then((res) => {
        this.removeStoreGroupUser(groupId, members);
        console.log("[GroupStore] Users removed successfully");
        return res;
      });
  };

  /**
   * 获取群组成员
   * @param groupId 群组ID
   * @param pageNum 页码
   */
  getGroupMembers = (groupId: string, pageNum: number) => {
    console.log("[GroupStore] Getting group members for:", groupId, "page:", pageNum);
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
        console.log("[GroupStore] Retrieved", res.data?.length || 0, "group members");
        return res;
      });
  };

  /**
   * 退出群组
   * @param groupId 群组ID
   */
  leaveGroup = (groupId: string) => {
    console.log("[GroupStore] Leaving group:", groupId);
    return ChatUIKIT.getChatConn()
      .leaveGroup({ groupId })
      .then((res) => {
        this.removeStoreGroup(groupId);
        console.log("[GroupStore] Successfully left group");
        return res;
      });
  };

  /**
   * 从store中获取群组信息
   * @param groupId 群组ID
   */
  getGroupInfoFromStore = (groupId: string) => {
    console.log("[GroupStore] Getting group info from store:", groupId);
    return this.joinedGroupList.find((group) => group.groupId === groupId);
  };

  /**
   * 清空群组通知未读数
   */
  clearGroupNoticeUnReadCount = () => {
    console.log("[GroupStore] Clearing group notice unread count");
    this.groupNoticeInfo.unReadCount = 0;
  };

  /**
   * 接受群组邀请
   * @param groupId 群组ID
   */
  acceptGroupInvite = (groupId: string) => {
    console.log("[GroupStore] Accepting group invite for:", groupId);
    return ChatUIKIT.getChatConn()
      .acceptGroupInvite({
        invitee: ChatUIKIT.getChatConn().user,
        groupId
      })
      .then(async () => {
        const res = await this.getGroupInfo(groupId);
        const info = res.data?.[0];
        if (info) {
          console.log("[GroupStore] Adding accepted group to joined list:", info.id);
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

  /**
   * 拒绝群组邀请
   * @param groupId 群组ID
   */
  rejectGroupInvite = (groupId: string) => {
    console.log("[GroupStore] Rejecting group invite for:", groupId);
    return ChatUIKIT.getChatConn().rejectGroupInvite({
      invitee: ChatUIKIT.getChatConn().user,
      groupId
    });
  };

  /**
   * 获取群组头像
   * @param groupId 群组ID
   */
  getGroupAvatar = (groupId: string) => {
    return this.groupAvatarMap.get(groupId) || "";
  };

  /**
   * 设置群组头像
   * @param groupId 群组ID
   * @param avatar 头像URL
   */
  setGroupAvatar = (groupId: string, avatar: string) => {
    this.groupAvatarMap.set(groupId, avatar);
  };

  /**
   * 检查是否有群组头像
   * @param groupId 群组ID
   */
  isHasGroupAvatar = (groupId: string) => {
    return this.groupAvatarMap.has(groupId);
  };

  /**
   * 清空群组Store
   */
  clear = () => {
    console.log("[GroupStore] Clearing group store");
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
      console.log("[GroupStore] Group store cleared");
    });
  };
}

export default GroupStore;
