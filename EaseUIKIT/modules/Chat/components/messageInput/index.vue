<template>
  <view class="message-input-wrap">
    <!-- #1ifndef WEB -->
    <view class="icon-wrap" @tap="isSendAudio = !isSendAudio">
      <image class="icon" :src="isSendAudio ? Keyboard : AudioIcon"></image>
    </view>
    <view class="send-audio" v-if="isSendAudio">
      <AudioMessageSender />
    </view>
    <!-- #1endif -->
    <view class="send-input" v-if="!isSendAudio">
      <input
        v-model="text"
        cursor-spacing="20"
        type="text"
        :adjust-position="true"
        :auto-blur="true"
        confirm-type="send"
        @confirm="handleSendMessage"
        :placeholder="t('sendMessagePlaceholder')"
      />
    </view>
    <view class="icon-wrap">
      <image class="icon" @tap.stop="showEmojiPicker" :src="EmojiIcon"></image>
    </view>
    <view class="icon-wrap">
      <image class="icon" @tap.stop="showToolbar" :src="PlusIcon"></image>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import AudioMessageSender from "../messageInputToolBar/audioSender.vue";
import { formatTextMessage } from "../../../../utils/index";
import PlusIcon from "../../../../assets/icon/plus.png";
import AudioIcon from "../../../../assets/icon/audioButton.png";
import Keyboard from "../../../../assets/icon/keyboard.png";
import EmojiIcon from "../../../../assets/icon/emoji.png";
import { EaseConnKit } from "../../../../index";
import { t } from "../../../../locales/index";
const emits = defineEmits([
  "onMessageSend",
  "onShowToolbar",
  "onShowEmojiPicker"
]);

const convStore = EaseConnKit.convStore;

// 是否发送语音消息
const isSendAudio = ref(false);

const SDK = EaseConnKit.connStore.getChatSDK();

const text = ref("");

const showToolbar = () => {
  // 切换语音发送，否则发送语音计算位置有问题
  isSendAudio.value = false;
  emits("onShowToolbar");
};

const showEmojiPicker = () => {
  emits("onShowEmojiPicker");
};

const handleSendMessage = async () => {
  let textMessage = formatTextMessage(text.value);
  const msg = SDK.message.create({
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    type: "txt",
    msg: textMessage,
    ext: {
      ease_chat_uikit_user_info: {
        avatarURL: EaseConnKit.appUserStore.getSelfUserInfo().avatar,
        nickname: EaseConnKit.appUserStore.getSelfUserInfo().name
      }
    }
  });
  text.value = "";
  try {
    await EaseConnKit.messageStore.sendMessage(msg);
    nextTick(() => {
      emits("onMessageSend");
    });
  } catch (error: any) {
    uni.showToast({
      title: `send failed: ${error.message}`,
      icon: "none"
    });
  }
};

defineExpose({
  insertEmoji(emoji: string) {
    text.value += emoji;
  }
});
</script>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
