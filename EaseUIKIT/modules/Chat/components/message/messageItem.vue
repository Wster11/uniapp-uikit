<template>
  <view
    class="msg-item-wrap"
    :style="{ flexDirection: isSelf ? 'row-reverse' : 'row' }"
  >
    <view class="avatar-wrap">
      <Avatar
        :size="28"
        :src="getUserInfo(msg.from || '').avatar || extUserInfo.avatarURL || ''"
        :placeholder="defaultAvatar"
      />
    </view>
    <view class="msg-content" :style="{ textAlign: isSelf ? 'right' : 'left' }">
      <view>
        <view class="user-nickname" v-if="!isSelf">
          {{ getUserInfo(msg.from || "").nickname || extUserInfo.nickname }}
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
            <view>[Custom]</view>
          </view>
        </view>
      </view>
      <view class="msg-time"
        >{{ getTimeStringAutoShort(msg.time, true) }}
      </view>
      <MessageActions
        ref="actionRef"
        :msg="msg"
        :isSelected="props.isSelected"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import Avatar from "../../../common/avatar/index.vue";
import TextMessage from "./messageTxt.vue";
import ImageMessage from "./messageImage.vue";
import VideoMessage from "./messageVideo.vue";
import AudioMessage from "./messageAudio.vue";
import MessageActions from "./messageActions.vue";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import type { MixedMessageBody } from "../../../../types/index";
import { ref, computed, getCurrentInstance } from "vue";
import { EaseConnKit } from "../../../../index";
import { getTimeStringAutoShort } from "../../../../utils/index";

interface Props {
  msg: MixedMessageBody;
  isSelected: boolean;
}
const props = defineProps<Props>();

const emits = defineEmits(["onLongPress"]);

const instance = getCurrentInstance();

const actionRef = ref(null);

const appUserStore = EaseConnKit.appUserStore;

const getUserInfo = (id: string) => {
  return (
    appUserStore.getUserInfoFromStore(id || "").nickname || extUserInfo.nickname
  );
};

const isSelf =
  EaseConnKit.connStore.getChatConn().user === props.msg.from ||
  props.msg.from === "";

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
  actionRef?.value?.handleLongPress(e, instance);
};
</script>

<style lang="scss" scoped>
.msg-item-wrap {
  display: flex;
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
    background: #e5f5ff;
    color: #171a1c;
  }

  .msg-bubble-self-bg {
    background: #009dff;
    color: #fff;
  }

  .msg-bubble {
    font-size: 16px;
    line-height: 22px;
    display: inline-block;
    word-break: break-all;
    border-radius: 4px;
    padding: 7px;
    max-width: calc(100vw - 100px);
    min-width: 15px;
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
}
</style>
