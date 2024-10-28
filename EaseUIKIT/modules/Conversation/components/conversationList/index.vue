<template>
  <view class="conversation-list-wrap">
    <view v-if="conversationList.length">
      <view
        v-for="conv in conversationList"
        :key="conv.conversationId"
        :data-id="conv.conversationId"
      >
        <ConversationItem
          :conversation="conv"
          :showMenu="
            selectedConvId ? selectedConvId === conv.conversationId : false
          "
          @mute="onMuteButtonClick"
          @pin="pinConversation"
          @delete="deleteConversation"
          @leftSwipe="handleLeftSwipe"
        />
      </view>
    </view>
    <view v-else class="conversation-empty"></view>
  </view>
</template>

<script setup lang="ts">
import ConversationItem from "../conversationItem/index.vue";
import { ref, onUnmounted } from "vue";
import type { EasemobChat } from "easemob-websdk";
import { t } from "../../../../locales/index";
import { EaseConnKit } from "../../../../index";
import { deepClone } from "../../../../utils/index";
import { autorun } from "mobx";

const selectedConvId = ref<EasemobChat.ConversationItem | null>(null);
const conversationList = ref<EasemobChat.ConversationItem[]>([]);

const uninstallConvListWatch = autorun(() => {
  conversationList.value = deepClone(EaseConnKit.convStore.conversationList);
});

const deleteConversation = (conv: EasemobChat.ConversationItem) => {
  EaseConnKit.convStore.deleteConversation(conv);
};

const muteConversation = (conv: EasemobChat.ConversationItem) => {
  EaseConnKit.convStore.setSilentModeForConversation(conv);
};

const unMuteConversation = (conv: EasemobChat.ConversationItem) => {
  EaseConnKit.convStore.clearRemindTypeForConversation(conv);
};

const pinConversation = (conv: EasemobChat.ConversationItem) => {
  EaseConnKit.convStore.pinConversation(conv, !conv.isPinned);
};

const onMuteButtonClick = (conv: EasemobChat.ConversationItem) => {
  const isMute = EaseConnKit.convStore.getConversationMuteStatus(
    conv.conversationId
  );
  if (isMute) {
    unMuteConversation(conv);
  } else {
    muteConversation(conv);
  }
};

const handleLeftSwipe = (convId: string | null) => {
  selectedConvId.value = convId;
};

onUnmounted(() => {
  uninstallConvListWatch();
});
</script>
<style lang="scss" scoped>
@import url("../../../../styles//common.scss");
@import url("./style.scss");
.dangerous-btn {
  color: #ff002b;
}
</style>
