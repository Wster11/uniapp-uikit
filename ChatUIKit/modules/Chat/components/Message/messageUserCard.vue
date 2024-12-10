<template>
  <view class="msg-user-card-wrap">
    <view :class="['msg-user-card', { isSelf: isSelfMessage }]">
      <Avatar
        class="user-card-avatar"
        :size="44"
        :src="userInfo.avatar"
        :placeholder="USER_AVATAR_URL"
      />
      <view class="user-name ellipsis">{{ userInfo.nickname }}</view>
    </view>
    <view class="tag">{{ t("contact") }}</view>
  </view>
</template>

<script lang="ts" setup>
import Avatar from "../../../../components/Avatar/index.vue";
import { USER_AVATAR_URL } from "../../../../const";
import { Chat } from "../../../../types";
import { ChatUIKit } from "../../../../index";
import { t } from "../../../../locales";
import { computed } from "vue";

interface Props {
  msg: Chat.CustomMsgBody;
}
const props = defineProps<Props>();

const isSelfMessage = ChatUIKit.messageStore.checkMessageFromIsSelf(props.msg);

const userInfo = computed(() => {
  const info = ChatUIKit.appUserStore.getUserInfoFromStore(
    props.msg.customExts.uid
  );
  return {
    nickname: info?.nickname || props.msg.customExts.nickname,
    avatar: info?.avatar || props.msg.customExts.avatar
  };
});
</script>

<style lang="scss" scoped>
.msg-user-card-wrap {
  width: 220px;
}

.msg-user-card {
  display: flex;
  align-items: center;
  padding: 4px 4px 12px 4px;
  margin-bottom: 4px;
  border-bottom: 0.5px solid #bac6de;
}

.isSelf {
  border-bottom: 0.5px solid #99d8ff;
}

.user-card-avatar {
  flex-shrink: 0;
}

.user-name {
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  margin-left: 12px;
}

.tag {
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
}
</style>
