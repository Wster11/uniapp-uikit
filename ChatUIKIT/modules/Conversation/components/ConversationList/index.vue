<template>
  <view class="conversation-list-wrap">
    <view v-if="conversationList.length">
      <view class="header-wrap">
        <ConversationNav />
        <SearchButton class="convs-search-btn" @tap="onSearch" />
      </view>
      <view class="convs-wrap">
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
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import ConversationNav from "../ConversationNav/index.vue";
import ConversationItem from "../ConversationItem/index.vue";
import SearchButton from "../../../../components/SearchButton/index.vue";
import Empty from "../../../../components/Empty/index.vue";
import { ref, onUnmounted } from "vue";
import type { Chat } from "../../../../types/index";
import { ChatUIKIT } from "../../../../index";
import { deepClone } from "../../../../utils/index";
import { autorun } from "mobx";

const selectedConvId = ref<Chat.ConversationItem | null>(null);
const conversationList = ref<Chat.ConversationItem[]>([]);

const userInfo = ref({});

const uninstallConvListWatch = autorun(() => {
  conversationList.value = deepClone(ChatUIKIT.convStore.conversationList);
});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getSelfUserInfo();
});

const deleteConversation = (conv: Chat.ConversationItem) => {
  ChatUIKIT.convStore.deleteConversation(conv);
};

const muteConversation = (conv: Chat.ConversationItem) => {
  ChatUIKIT.convStore.setSilentModeForConversation(conv);
};

const unMuteConversation = (conv: Chat.ConversationItem) => {
  ChatUIKIT.convStore.clearRemindTypeForConversation(conv);
};

const pinConversation = (conv: Chat.ConversationItem) => {
  ChatUIKIT.convStore.pinConversation(conv, !conv.isPinned);
};

const onMuteButtonClick = (conv: Chat.ConversationItem) => {
  const isMute = ChatUIKIT.convStore.getConversationMuteStatus(
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

const onSearch = () => {
  uni.navigateTo({
    url: "/ChatUIKIT/modules/ConversationSearchList/index"
  });
};

onUnmounted(() => {
  uninstallConvListWatch();
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
.title {
  width: 50px;
  height: 22px;
  background: url("../../../../assets/chat.png") no-repeat;
  background-size: 100% 100%;
}

.btn-wrap {
  display: flex;
  width: 32px;
  justify-content: flex-end;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/plus.png") no-repeat;
  background-size: 100% 100%;
}

.header-wrap {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999;
  padding: 8px;
  width: 100%;
  background: #f9fafa;
  box-sizing: border-box;
}

.convs-search-btn {
  margin: 8px;
}

.convs-wrap {
  padding-top: calc(112px + var(--status-bar-height));
}

@import url("../../../../styles//common.scss");
@import url("./style.scss");
.dangerous-btn {
  color: #ff002b;
}
</style>
