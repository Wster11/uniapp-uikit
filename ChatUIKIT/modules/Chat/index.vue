<template>
  <view class="chat-wrap">
    <!-- 消息列表 -->
    <view class="msgs-wrap">
      <!-- 遮照层,点击关闭Toolbar -->
      <view v-if="isShowMask" class="mask" @tap="closeToolbar"></view>
      <MessageList
        ref="msgListRef"
        :conversationId="conversationId"
        :conversationType="conversationType"
      />
    </view>
    <MessageQuotePanel />
    <!-- 消息编辑 -->
    <MessageEdit />
    <!-- 输入框 -->
    <view class="chat-input-wrap">
      <MessageInput
        ref="msgInputRef"
        :preventEvent="isShowToolbar || isShowEmojiPicker"
        @onInputTap="onInputTap"
        @onShowToolbar="
          isShowToolbar = true;
          isShowEmojiPicker = false;
        "
        @onShowEmojiPicker="
          isShowEmojiPicker = true;
          isShowToolbar = false;
        "
      />
    </view>
    <!-- input toolbar -->
    <view v-if="isShowToolbar" class="chat-input-toolbar-wrap">
      <MessageInputToolbar />
    </view>
    <!-- emoji picker -->
    <EmojiPicker v-if="isShowEmojiPicker" @onEmojiPick="onEmojiPick" />
  </view>
</template>

<script setup lang="ts">
import MessageList from "./components/message/messageList.vue";
import MessageInput from "./components/messageInput/index.vue";
import MessageInputToolbar from "./components/messageInputToolBar/index.vue";
import EmojiPicker from "./components/messageInputToolBar/emojiPicker.vue";
import MessageQuotePanel from "./components/message/messageQuotePanel.vue";
import MessageEdit from "./components/message/messageEdit.vue";
import { ref, onMounted, computed, onUnmounted, provide } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { InputToolbarEvent, Chat } from "../../types/index";
import { autorun } from "mobx";
import { ChatUIKIT } from "../../index";

const msgListRef = ref(null);
const msgInputRef = ref(null);
const conversationId = ref("");
const isShowToolbar = ref(false);
const isShowEmojiPicker = ref(false);
const conversationType = ref<Chat.ConversationItem["conversationType"]>(
  "" as Chat.ConversationItem["conversationType"]
);
const appUserStore = ChatUIKIT.appUserStore;
const groupStore = ChatUIKIT.groupStore;

const isShowMask = computed(() => {
  return isShowToolbar.value || isShowEmojiPicker.value;
});

const unwatchQuoteMsg = autorun(() => {
  if (ChatUIKIT.messageStore.quoteMessage) {
    msgInputRef?.value?.setIsFocus(true);
  } else {
    msgInputRef?.value?.setIsFocus(false);
  }
});

const onInputTap = () => {
  closeToolbar();
  msgInputRef?.value?.setIsFocus(true);
};

const closeToolbar = () => {
  if (isShowToolbar.value === true) {
    isShowToolbar.value = false;
  }
  if (isShowEmojiPicker.value === true) {
    isShowEmojiPicker.value = false;
  }
};

const onEmojiPick = (alt: string) => {
  //@ts-ignore
  msgInputRef?.value.insertEmoji(alt);
};

onMounted(() => {
  if (!conversationId.value && !conversationType.value) {
    return;
  }
  ChatUIKIT.convStore.markConversationRead({
    conversationId: conversationId.value,
    conversationType: conversationType.value
  });
});

onUnmounted(() => {
  ChatUIKIT.convStore.setCurrentConversation(null);
  unwatchQuoteMsg();
});

onLoad((option) => {
  conversationType.value = option?.type;
  conversationId.value = option?.id;
  if (option?.id) {
    ChatUIKIT.convStore.setCurrentConversation({
      conversationId: conversationId.value,
      conversationType: conversationType.value
    });
    let title = "";
    if (conversationType.value === "singleChat") {
      title = appUserStore.getUserInfoFromStore(conversationId.value).name;
    } else {
      title =
        groupStore.getGroupInfoFromStore(conversationId.value)?.groupName || "";
    }
    uni.setNavigationBarTitle({
      title: title
    });
  }
});

provide<InputToolbarEvent>("InputToolbarEvent", {
  closeToolbar
});
</script>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
