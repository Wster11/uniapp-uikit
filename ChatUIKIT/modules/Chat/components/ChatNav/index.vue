<template>
  <view>
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="left-content">
          <Avatar
            :size="32"
            :src="info.avatar"
            :placeholder="isSingleChat ? USER_AVATAR_URL : GROUP_AVATAR_URL"
            :withPresence="isSingleChat ? true : false"
            :presenceExt="info.presenceExt"
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
import { ChatUIKIT } from "../../../../index";
import { USER_AVATAR_URL, GROUP_AVATAR_URL } from "../../../../const";
import { autorun } from "mobx";

const info = ref({
  avatar: "",
  name: ""
});

const isSingleChat = computed(() => {
  return info.value.conversationType === "singleChat";
});

const unwatchUserInfo = autorun(() => {
  const conv = ChatUIKIT.convStore.currConversation;
  if (conv?.conversationType === "singleChat") {
    const userinfo = ChatUIKIT.appUserStore.getUserInfoFromStore(
      conv.conversationId
    );
    info.value = {
      name: userinfo?.name,
      id: conv.conversationId,
      avatar: userinfo?.avatar,
      conversationType: conv.conversationType,
      presenceExt: userinfo?.presenceExt
    };
  } else if (conv?.conversationType === "groupChat") {
    const groupInfo = ChatUIKIT.groupStore.getGroupInfoFromStore(
      conv.conversationId
    );

    info.value = {
      name: groupInfo?.groupName,
      id: conv.conversationId,
      avatar: ChatUIKIT.groupStore.getGroupAvatar(conv.conversationId),
      conversationType: conv.conversationType
    };
  }
});

const onBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  isSingleChat &&
    ChatUIKIT.appUserStore.getUsersPresenceFromServer({
      userIdList: [info.value.id]
    });
});

onUnmounted(() => {
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
@import url("../../../../styles/common.scss");

.name {
  max-width: 60vw;
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
</style>
