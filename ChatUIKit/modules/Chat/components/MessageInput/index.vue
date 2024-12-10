<template>
  <view class="message-input-wrap">
    <!-- #ifndef WEB -->
    <view
      v-if="featureConfig.inputAudio"
      @tap="showAudioPopup"
      class="icon-wrap"
    >
      <view class="icon audio-icon"></view>
    </view>
    <AudioMessageSender v-if="featureConfig.inputAudio" ref="audioPopupRef" />
    <!-- #endif -->
    <view class="send-input" @tap="onInputTap">
      <input
        :class="[{ 'prevent-event': props.preventEvent }]"
        v-model="text"
        cursor-spacing="20"
        type="text"
        :focus="isFocus"
        :adjust-position="false"
        :auto-blur="true"
        confirm-type="send"
        :confirm-hold="true"
        @input="onInput"
        @confirm="handleSendMessage"
        @blur="onBlur"
        @focus="onFocus"
        :placeholder="t('sendMessagePlaceholder')"
      />
    </view>
    <view v-if="featureConfig.inputEmoji" class="icon-wrap">
      <view class="icon emoji-icon" @tap.stop="showEmojiPicker"></view>
    </view>
    <view class="icon-wrap" v-if="isShowToolbar && text.length === 0">
      <view class="icon plus-icon" @tap.stop="showToolbar"></view>
    </view>
    <view class="icon-wrap" v-else>
      <view class="icon send-icon" @tap.stop="handleSendMessage"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import AudioMessageSender from "../MessageInputToolBar/audioSender.vue";
import { formatTextMessage, formatMessage } from "../../../../utils/index";
import { ChatUIKit } from "../../../../index";
import { t } from "../../../../locales/index";
import { AT_ALL } from "../../../../const/index";
import { MessageQuoteExt } from "../../../../types/index";
import { chatSDK } from "../../../../sdk";

interface Props {
  preventEvent: boolean; // 输入框是否禁止事件
}

const featureConfig = ChatUIKit.getFeatureConfig();

const isShowToolbar = featureConfig.inputVideo || featureConfig.inputImage;

const props = defineProps<Props>();

const emits = defineEmits([
  "onMessageSend",
  "onShowToolbar",
  "onShowEmojiPicker",
  "onRecordAudio",
  "onInputTap",
  "onBlur",
  "onFocus",
  "onMention"
]);

const convStore = ChatUIKit.convStore;

const isFocus = ref(false);

const audioPopupRef = ref(null);

const text = ref("");

const mentionUserIds = ref<string[]>([]);

const showAudioPopup = () => {
  audioPopupRef.value.showAudioPopup();
  emits("onRecordAudio");
};

const showToolbar = () => {
  emits("onShowToolbar");
};

const showEmojiPicker = () => {
  emits("onShowEmojiPicker");
};

const onInputTap = () => {
  emits("onInputTap");
};

const onInput = (e: any) => {
  // uni-app recognizes mention messages
  const text = e?.detail?.value;
  if (
    ChatUIKit.getFeatureConfig().inputMention &&
    ChatUIKit.convStore.currConversation?.conversationType === "groupChat"
  ) {
    if (text.endsWith("@") || text.endsWith("@\n")) {
      isFocus.value = false;
      emits("onMention", true);
    }
  }
};

const handleSendMessage = async () => {
  let textMessage = formatTextMessage(text.value).trim();
  if (!textMessage) {
    console.warn("No text message");
    return;
  }
  let msgQuoteExt: MessageQuoteExt = {} as MessageQuoteExt;
  let isAtAll = false;
  mentionUserIds.value;
  if (mentionUserIds.value.includes(AT_ALL)) isAtAll = true;
  const quoteMessage = ChatUIKit.messageStore.quoteMessage;
  if (quoteMessage) {
    msgQuoteExt = {
      msgID: quoteMessage.serverMsgId || quoteMessage.id,
      msgPreview: formatMessage(quoteMessage),
      msgSender: ChatUIKit.appUserStore.getSelfUserInfo().nickname || "",
      msgType: quoteMessage.type
    };
    ChatUIKit.messageStore.setQuoteMessage(null);
  }
  const msg = chatSDK.message.create({
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    type: "txt",
    msg: textMessage,
    ext: {
      em_at_list: isAtAll ? AT_ALL : mentionUserIds.value,
      ease_chat_uikit_user_info: {
        avatarURL: ChatUIKit.appUserStore.getSelfUserInfo().avatar,
        nickname: ChatUIKit.appUserStore.getSelfUserInfo().name
      },
      msgQuote: msgQuoteExt?.msgID ? msgQuoteExt : undefined
    }
  });
  text.value = "";
  mentionUserIds.value = [];
  try {
    await ChatUIKit.messageStore.sendMessage(msg);
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

const onBlur = () => {
  isFocus.value = false;
  emits("onBlur");
};

const onFocus = () => {
  isFocus.value = true;
  emits("onFocus");
};

defineExpose({
  insertText(emoji: string) {
    text.value += emoji;
  },
  setIsFocus(focus: boolean) {
    isFocus.value = focus;
  },
  addMentionUserIds(userIds: string[]) {
    mentionUserIds.value = [...new Set([...mentionUserIds.value, ...userIds])];
  }
});
</script>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
