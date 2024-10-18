<template>
  <view class="message-input-wrap">
    <!-- #ifndef WEB -->
    <view class="icon-wrap" @tap="isSendAudio = !isSendAudio">
      <image class="icon" :src="isSendAudio ? Keyboard : AudioIcon"></image>
    </view>
    <view class="send-audio" v-if="isSendAudio">
      <AudioMessageSender />
    </view>
    <!-- #endif -->
    <view class="send-input" v-if="!isSendAudio">
      <input
        v-model="text"
        :adjust-position="true"
        :auto-blur="true"
        confirm-type="send"
        @confirm="handleSendMessage"
        :placeholder="t('sendMessagePlaceholder')"
      />
    </view>
    <view class="icon-wrap">
      <image class="icon" @tap.stop="showToolbar" :src="PlusIcon"></image>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import AudioMessageSender from "../messageInputToolBar/audioSender.vue";
import PlusIcon from "../../../../assets/icon/plus.png";
import AudioIcon from "../../../../assets/icon/audioButton.png";
import Keyboard from "../../../../assets/icon/keyboard.png";
import { EaseConnKit } from "../../../../index";
import { t } from "../../../../locales/index";
const emits = defineEmits(["onMessageSend", "onShowToolbar"]);

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

const handleSendMessage = async () => {
  const msg = SDK.message.create({
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    type: "txt",
    msg: text.value,
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
</script>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
