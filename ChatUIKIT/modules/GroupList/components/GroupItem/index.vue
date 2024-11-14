<template>
  <view class="item-wrap">
    <Avatar
      class="avatar"
      :size="40"
      :src="''"
      :placeholder="GROUP_AVATAR_URL"
    />
    <view class="right">
      <view class="name ellipsis">{{ props.group.groupName }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../common/Avatar/index.vue";
import type { Chat } from "../../../../sdk";
import { GROUP_AVATAR_URL } from "../../../../const/index";

interface Props {
  group: Chat.GroupInfo;
}

const props = defineProps<Props>();
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

.avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.name {
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
