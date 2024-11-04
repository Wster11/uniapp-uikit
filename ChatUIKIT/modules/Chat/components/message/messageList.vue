<template>
  <view :class="['msg-list-wrap']" @tap="resetMessageState">
    <scroll-view
      scroll-y
      :scroll-top="scrollHeight"
      :scroll-into-view="`msg-${currentViewMsgId}`"
      @scrolltolower="loadMore"
      class="message-scroll-list"
    >
      <view class="message-item-list">
        <view style="flex: 1"></view>

        <view
          :class="['scroll-msg-item', { blink: blinkMsgId === msg.id }]"
          v-for="(msg, idx) in msgs"
          :id="`msg-${msg.id}`"
          :key="msg.id"
        >
          <MessageTime
            :curr-time="msg.time"
            :prev-time="idx > 0 ? msgs[idx - 1].time : 0"
          />
          <NoticeMessageItem
            v-if="msg?.noticeInfo?.type === 'notice'"
            :msg="msg"
          />
          <MessageItem
            v-else
            :msg="msg"
            @onLongPress="onMessageLongPress"
            @jumpToMessage="setViewMsgId"
            :isSelected="msg.id === selectedMsgId"
          />
        </view>
      </view>
      <view v-if="isLoading" class="loading"></view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import type { EasemobChat } from "easemob-websdk/Easemob-chat";
import MessageItem from "./messageItem.vue";
import MessageTime from "./messageTime.vue";
import NoticeMessageItem from "./noticeMessageItem.vue";
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import type { MixedMessageBody } from "../../../../types/index";
import { ChatUIKIT } from "../../../../index";
import { t } from "../../../../locales/index";
import { autorun } from "mobx";
import { deepClone } from "../../../../utils/index";

interface Props {
  conversationId: string;
  conversationType: EasemobChat.ConversationItem["conversationType"];
}
const props = defineProps<Props>();

const scrollHeight = ref(0);

const isLoading = ref(false);

const currentViewMsgId = ref<string>("");

const messageStore = ChatUIKIT.messageStore;

const isLast = ref(true);

const cursor = ref("");

const selectedMsgId = ref("");

const blinkMsgId = ref(""); // 闪烁的消息id

const msgs = ref<MixedMessageBody[]>([]);

let uninstallMsgWatch: any = null;

const onMessageLongPress = (msgId: string) => {
  selectedMsgId.value = msgId;
};

const resetMessageState = () => {
  selectedMsgId.value = "";
};

onMounted(() => {
  uninstallMsgWatch = autorun(() => {
    const convMessageInfo = deepClone(
      messageStore.conversationMessagesMap.get(props.conversationId)
    );
    if (convMessageInfo) {
      msgs.value = convMessageInfo.messageIds.map((id) => {
        return deepClone(ChatUIKIT.messageStore.messageMap.get(id));
      });
      isLast.value = convMessageInfo.isLast;
      cursor.value = convMessageInfo.cursor;
      if (isLoading.value || currentViewMsgId.value) {
        return;
      }
      nextTick(() => {
        scrollToBottom();
      });
    }
  });
  if (!messageStore.conversationMessagesMap.has(props.conversationId)) {
    messageStore.getHistoryMessages({
      conversationId: props.conversationId,
      conversationType: props.conversationType
    } as EasemobChat.ConversationItem);
  }
});

const loadMore = async () => {
  if (isLast.value === true || isLoading.value === true) {
    return;
  }
  isLoading.value = true;
  try {
    await messageStore.getHistoryMessages(
      {
        conversationId: props.conversationId,
        conversationType: props.conversationType
      } as EasemobChat.ConversationItem,
      cursor.value
    );
    nextTick(() => {
      isLoading.value = false;
    });
  } catch (error) {
    isLoading.value = false;
  }
};

const scrollToBottom = () => {
  scrollHeight.value = 0;
  setTimeout(() => {
    scrollHeight.value += 1;
  }, 200);
};

const setViewMsgId = (msgId: string) => {
  if (blinkMsgId.value) {
    return;
  }
  currentViewMsgId.value = msgId;
  blinkMsgId.value = msgId;
  setTimeout(() => {
    blinkMsgId.value = "";
    currentViewMsgId.value = "";
  }, 1000);
};

onUnmounted(() => {
  uninstallMsgWatch && uninstallMsgWatch();
});

defineExpose({
  scrollToBottom
});
</script>

<style lang="scss" scoped>
.msg-list-wrap {
  height: 100%;
  overflow: hidden;
}

.message-scroll-list {
  flex: 1;
  height: 100%;
  overflow: hidden auto;
  background-color: #f9fafa;
  transform: rotate(180deg);
}

@keyframes blink {
  0% {
    background-color: #f9fafa;
  }
  50% {
    background-color: #e0e0e0; /* 可以调整颜色 */
  }
  100% {
    background-color: #f9fafa;
  }
}

.blink {
  animation: blink 1s infinite;
}

.scroll-msg-item {
  padding: 0 15px;
  transform: rotate(-180deg);

}

.loadMore {
  text-align: center;
  font-size: 14px;
  margin: 5px 0;
  color: #999;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading {
  width: 20px;
  height: 20px;
  margin: 10px auto;
  background-position: center center;
  background-image: url("../../../../assets/icon/spinner.png");
  background-size: 100%;
  animation: spin 1s linear infinite;
  background-repeat: no-repeat;
}

scroll-view ::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

.msg-items-wrap {
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
}

.message-item-list {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>
