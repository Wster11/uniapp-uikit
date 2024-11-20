<template>
  <view class="item-wrap">
    <Avatar
      class="user-avatar"
      :size="40"
      :src="avatar || userInfo.avatar"
      :placeholder="USER_AVATAR_URL"
    />
    <view class="right">
      <view class="content">
        <view class="user-name ellipsis">{{ userInfo.name }}</view>
        <view class="tip ellipsis">请求添加您为好友</view>
      </view>

      <view class="action" @tap="acceptContactInvite">
        <view class="btn">添加</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../common/Avatar/index.vue";
import type { Chat } from "../../../../sdk";
import { USER_AVATAR_URL } from "../../../../const/index";
import { ChatUIKIT } from "../../../../index";
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";

interface Props {
  user: Chat.ContactItem;
  avatar?: string;
}

const props = defineProps<Props>();

const userInfo = ref({});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getUserInfoFromStore(
    props.user.userId
  );
});

const acceptContactInvite = () => {
  ChatUIKIT.contactStore.acceptContactInvite(props.user.userId);
};

onUnmounted(() => {
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
@import url("../../../../styles/common.scss");
.item-wrap {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 60px;
  align-items: center;
  padding-left: 16px;
  &:active {
    background-color: #f5f5f5;
  }
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
  max-width: calc(100vw - 100px);
}

.right {
  flex: 1;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid #e3e6e8;
}

.content {
  display: flex;
  flex-direction: column;
}

.tip {
  color: #75828a;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  max-width: calc(100vw - 100px);
}

.action {
  margin-right: 16px;
}

.btn {
  min-width: 80px;
  text-align: center;
  border-radius: 4px;
  padding: 4px 8px;
  background-color: #009dff;
  color: #f9fafa;
}
</style>
