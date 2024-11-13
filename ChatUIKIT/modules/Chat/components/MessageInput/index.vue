<template>
  <view class="message-input-wrap">
    <!-- #1ifndef WEB -->
    <view
      v-if="featureConfig.inputAudio"
      @tap="showAudioPopup"
      class="icon-wrap"
    >
      <image class="icon" :src="AudioIcon"></image>
    </view>

    <AudioMessageSender v-if="featureConfig.inputAudio" ref="audioPopupRef" />

    <!-- #1endif -->
    <view class="send-input" @tap="onInputTap">
      <input
        :class="[{ 'prevent-event': props.preventEvent }]"
        v-model="text"
        cursor-spacing="20"
        type="text"
        :focus="isFocus"
        :adjust-position="true"
        :auto-blur="true"
        confirm-type="send"
        @input="onInput"
        @confirm="handleSendMessage"
        @blur="onBlur"
        @focus="onFocus"
        :placeholder="t('sendMessagePlaceholder')"
      />
    </view>
    <view v-if="featureConfig.inputEmoji" class="icon-wrap">
      <image class="icon" @tap.stop="showEmojiPicker" :src="EmojiIcon"></image>
    </view>
    <view class="icon-wrap" v-if="isShowToolbar && text.length === 0">
      <image class="icon" @tap.stop="showToolbar" :src="PlusIcon"></image>
    </view>
    <view class="icon-wrap" v-else>
      <image class="icon" @tap.stop="handleSendMessage" :src="SendIcon"></image>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import AudioMessageSender from "../MessageInputToolBar/audioSender.vue";
import { formatTextMessage, formatMessage } from "../../../../utils/index";
import PlusIcon from "../../../../assets/icon/plus.png";
import AudioIcon from "../../../../assets/icon/audioButton.png";
import Keyboard from "../../../../assets/icon/keyboard.png";
import EmojiIcon from "../../../../assets/icon/emoji.png";
import SendIcon from "../../../../assets/icon/send.png";
import { ChatUIKIT } from "../../../../index";
import { t } from "../../../../locales/index";
import { AT_ALL } from "../../../../const/index";
import { MessageQuoteExt } from "../../../../types/index";
import { chatSDK } from "../../../../sdk";

interface Props {
  preventEvent: boolean; // 输入框是否禁止事件
}

const featureConfig = ChatUIKIT.getFeatureConfig();

const isShowToolbar = featureConfig.inputVideo || featureConfig.InputImage;

const props = defineProps<Props>();

const emits = defineEmits([
  "onMessageSend",
  "onShowToolbar",
  "onShowEmojiPicker",
  "onInputTap",
  "onBlur",
  "onFocus",
  "onMention"
]);

const convStore = ChatUIKIT.convStore;

const convType = ChatUIKIT.convStore.currConversation?.conversationType;

const isFocus = ref(false);

const audioPopupRef = ref(null);

const text = ref("");

const mentionUserIds = ref<string>([]);

const showAudioPopup = () => {
  audioPopupRef.value.showAudioPopup();
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
  if (convType === "groupChat") {
    if (text.endsWith("@") || text.endsWith("@\n")) {
      isFocus.value = false;
      emits("onMention", true);
    }
  }
};

const handleSendMessage = async () => {
  let textMessage = formatTextMessage(text.value);
  let msgQuoteExt: MessageQuoteExt = {} as MessageQuoteExt;
  let isAtAll = false;
  mentionUserIds.value;
  if (mentionUserIds.value.includes(AT_ALL)) isAtAll = true;
  const quoteMessage = ChatUIKIT.messageStore.quoteMessage;
  if (quoteMessage) {
    msgQuoteExt = {
      msgID: quoteMessage.id,
      msgPreview: formatMessage(quoteMessage),
      msgSender: ChatUIKIT.appUserStore.getSelfUserInfo().nickname,
      msgType: quoteMessage.type
    };
    ChatUIKIT.messageStore.setQuoteMessage(null);
  }
  const msg = chatSDK.message.create({
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    type: "txt",
    msg: textMessage,
    ext: {
      em_at_list: isAtAll ? AT_ALL : mentionUserIds.value,
      ease_chat_uikit_user_info: {
        avatarURL: ChatUIKIT.appUserStore.getSelfUserInfo().avatar,
        nickname: ChatUIKIT.appUserStore.getSelfUserInfo().name
      },
      msgQuote: msgQuoteExt?.msgID ? msgQuoteExt : null
    }
  });
  text.value = "";
  mentionUserIds.value = [];
  try {
    await ChatUIKIT.messageStore.sendMessage(msg);
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
