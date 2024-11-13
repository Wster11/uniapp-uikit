<template>
  <view class="item-wrap">
    <Avatar
      class="user-avatar"
      :size="40"
      :src="avatar || userInfo.avatar"
      :placeholder="USER_AVATAR_URL"
    />
    <view class="right">
      <view class="user-name ellipsis">{{ userInfo.name }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../common/avatar/index.vue";
import type { Chat } from "../../../../sdk";
import { USER_AVATAR_URL } from "../../../../const/index";
import { ChatUIKIT } from "../../../../index";
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";

interface Props {
  contact: Chat.ContactItem;
  avatar?: string;
}

const props = defineProps<Props>();

const userInfo = ref({});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getUserInfoFromStore(
    props.contact.userId
  );
});

onUnmounted(() => {
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
@import url("../../../../styles/common.scss");
.item-wrap {
  display: flex;
  width: 100vw;
  height: 60px;
  align-items: center;
  padding-left: 16px;
}

.user-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.user-name {
  font-size: 16px;
  color: #171a1c;
  line-height: 22px;
  font-weight: 500;
  max-width: calc(100vw - 90px);
}

.right {
  flex: 1;
  display: flex;
  height: 100%;
  align-items: center;
  border-bottom: 0.5px solid #e3e6e8;
}
</style>
