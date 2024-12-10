<template>
  <view>
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="left-content">
          <Avatar
            class="nav-avatar"
            :size="32"
            :src="info.avatar"
            :placeholder="isSingleChat ? USER_AVATAR_URL : GROUP_AVATAR_URL"
            :withPresence="isSingleChat ? true : false"
            :presenceExt="info.presenceExt"
            :isOnline="info.isOnline"
          />
          <view class="name ellipsis">{{ info.name }}</view>
        </view>
      </template>
    </NavBar>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../../components/Avatar/index.vue";
import NavBar from "../../../../components/NavBar/index.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ChatUIKit } from "../../../../index";
import { Chat } from "../../../../types";
import { USER_AVATAR_URL, GROUP_AVATAR_URL } from "../../../../const";
import { autorun } from "mobx";

type ChatNavInfo = {
  avatar: string;
  name: string;
  id: string;
  conversationType?: Chat.ChatType;
  presenceExt?: string;
  isOnline?: boolean;
};

const info = ref<ChatNavInfo>({
  avatar: "",
  name: "",
  id: ""
});

const isSingleChat = computed(() => {
  return info.value.conversationType === "singleChat";
});

const featureConfig = ChatUIKit.getFeatureConfig();

const unwatchUserInfo = autorun(() => {
  const conv = ChatUIKit.convStore.currConversation;
  if (conv?.conversationType === "singleChat") {
    const userinfo = ChatUIKit.appUserStore.getUserInfoFromStore(
      conv.conversationId
    );
    info.value = {
      name: userinfo?.name,
      id: conv.conversationId,
      avatar: userinfo?.avatar,
      conversationType: conv.conversationType,
      presenceExt: userinfo?.presenceExt,
      isOnline: userinfo?.isOnline
    };
  } else if (conv?.conversationType === "groupChat") {
    const groupInfo = ChatUIKit.groupStore.getGroupInfoFromStore(
      conv.conversationId
    );

    info.value = {
      name: groupInfo?.groupName || conv.conversationId,
      id: conv.conversationId,
      avatar: ChatUIKit.groupStore.getGroupAvatar(conv.conversationId),
      conversationType: conv.conversationType
    };
  }
});

const onBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  if (featureConfig.usePresence && isSingleChat) {
    // 获取用户在线状态
    ChatUIKit.appUserStore.getUsersPresenceFromServer({
      userIdList: [info.value.id]
    });
    // 订阅用户在线状态
    ChatUIKit.appUserStore.subscribePresence({
      userIdList: [info.value.id]
    });
  }
});

onUnmounted(() => {
  if (featureConfig.usePresence && isSingleChat) {
    // 取消订阅用户在线状态
    ChatUIKit.appUserStore.unsubscribePresence({
      userIdList: [info.value.id]
    });
  }
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
@import url("../../../../styles/common.scss");

.name {
  max-width: 45vw;
  color: #171a1c;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  margin-left: 8px;
}

.left-content {
  display: flex;
  align-items: center;
}

.nav-avatar {
  height: 32px;
}
</style>
