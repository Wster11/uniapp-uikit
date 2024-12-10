<template>
  <view
    class="msg-item-wrap"
    :style="{ flexDirection: isSelf ? 'row-reverse' : 'row' }"
  >
    <view class="avatar-wrap">
      <Avatar
        :size="28"
        :src="getUserInfo(msg.from || '').avatar || extUserInfo.avatarURL || ''"
        :placeholder="USER_AVATAR_URL"
      />
    </view>
    <view class="msg-content" :style="{ textAlign: isSelf ? 'right' : 'left' }">
      <view>
        <view class="user-nickname" v-if="!isSelf">
          {{ getUserInfo(msg.from || "").nickname || extUserInfo.nickname }}
        </view>
        <view
          v-if="msg.ext.msgQuote && msg.ext.msgQuote.msgID"
          class="msg-quote-container"
        >
          <MessageQuote
            :msgId="msg.ext.msgQuote.msgID"
            :messageQuoteExt="msg.ext.msgQuote"
            :titleStyle="{ justifyContent: isSelf ? 'flex-end' : 'flex-start' }"
            @jumpToMessage="jumpToMessage"
          />
        </view>
        <view
          :class="bubbleClass"
          :id="'msg-bubble-' + msg.id"
          @longpress="
            (e) => {
              onMessageBubblePress(e);
            }
          "
        >
          <MessageStatus
            v-if="messageStatus && isSelf && msg.status"
            :msg="msg"
          />
          <view v-if="msg.type === 'txt'">
            <TextMessage :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'img'">
            <ImageMessage :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'video'">
            <VideoMessage :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'audio'">
            <AudioMessage :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'custom'">
            <UserCardMessage v-if="msg.customEvent === 'userCard'" :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'file'">
            <FileMessage :msg="msg" />
          </view>
        </view>
      </view>
      <view class="msg-time"
        >{{ getTimeStringAutoShort(msg.time, true) }}
      </view>
      <MessageActions
        v-if="props.isSelected"
        ref="actionRef"
        :msg="msg"
        :isSelected="props.isSelected"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import Avatar from "../../../../components/Avatar/index.vue";
import TextMessage from "./messageTxt.vue";
import ImageMessage from "./messageImage.vue";
import VideoMessage from "./messageVideo.vue";
import AudioMessage from "./messageAudio.vue";
import FileMessage from "./messageFile.vue";
import UserCardMessage from "./messageUserCard.vue";
import MessageQuote from "./messageQuote.vue";
import MessageActions from "./messageActions.vue";
import MessageStatus from "./messageStatus.vue";
import type { MixedMessageBody } from "../../../../types/index";
import { ref, computed, getCurrentInstance } from "vue";
import { ChatUIKit } from "../../../../index";
import { getTimeStringAutoShort } from "../../../../utils/index";
import { USER_AVATAR_URL } from "../../../../const/index";

interface Props {
  msg: MixedMessageBody;
  isSelected: boolean;
}
const props = defineProps<Props>();

const emits = defineEmits(["onLongPress", "jumpToMessage"]);

const jumpToMessage = (id) => {
  emits("jumpToMessage", id);
};

const instance = getCurrentInstance();

const actionRef = ref(null);

const appUserStore = ChatUIKit.appUserStore;

const getUserInfo = (id: string) => {
  return appUserStore.getUserInfoFromStore(id || "");
};

const messageStatus = ChatUIKit.getFeatureConfig().messageStatus;

const isSelf =
  ChatUIKit.getChatConn().user === props.msg.from || props.msg.from === "";

const extUserInfo = props.msg.ext?.ease_chat_uikit_user_info || {};

const bubbleClass = computed(() => {
  let className = "msg-bubble";
  if (props.msg.type !== "img" && props.msg.type !== "video") {
    if (isSelf) {
      className = "msg-bubble msg-bubble-self-bg";
    } else {
      className = "msg-bubble msg-bubble-bg";
    }
  }
  return className;
});

const onMessageBubblePress = (e) => {
  emits("onLongPress", props.msg.id);
  setTimeout(() => {
    actionRef?.value?.handleLongPress(e, instance);
  }, 0);
};
</script>

<style lang="scss" scoped>
.msg-item-wrap {
  width: 100%;
  display: flex;
  margin-bottom: 15px;
  align-items: center;
  color: #333;

  .user-nickname {
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
    color: #5270ad;
  }

  .msg-bubble-bg {
    padding: 8px;
    background: #e5f5ff;
    color: #171a1c;
  }

  .msg-bubble-self-bg {
    padding: 8px;
    background: #009dff;
    color: #fff;
  }

  .msg-bubble {
    position: relative;
    font-size: 16px;
    line-height: 22px;
    display: inline-block;
    word-break: break-all;
    border-radius: 4px;
    max-width: calc(100vw - 100px);
    min-width: 15px;
  }

  .msg-bubble-bg:before {
    content: "";
    position: absolute;
    left: -9px;
    bottom: 10px;
    border: 5px solid transparent;
    border-right: 5px solid #e5f5ff;
  }

  .msg-bubble-self-bg:before {
    content: "";
    position: absolute;
    right: -9px;
    bottom: 10px;
    border: 5px solid transparent;
    border-left: 5px solid #009dff;
  }

  .msg-content {
    width: 100%;
    position: relative;
    margin: 10px 8px -12px 8px;
  }

  .avatar-wrap {
    align-self: self-end;
  }

  .msg-time {
    font-size: 12px;
    color: #acb4b9;
    line-height: 16px;
  }

  .msg-quote-container {
    margin-bottom: 2px;
  }
}
</style>
