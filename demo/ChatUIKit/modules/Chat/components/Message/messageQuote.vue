<template>
  <view class="msg-quote-wrap">
    <view class="quote-brief" @click="jumpToMessage">
      <view class="title" :style="titleStyle ? titleStyle : {}">
        <view class="user" v-if="props.isReplying" v-text="you"></view>
        <view class="tip" v-if="props.isReplying" v-text="reply"></view>
        <view class="user" v-if="quoteFrom">{{ quoteFrom.nickname }}</view>
      </view>
      <view class="content">
        <span class="msg ellipsis">
          <span
            v-for="(item, idx) in data"
            :class="[{ 'emoji-wrap': item.type !== 'text' }]"
            :key="idx"
          >
            <span v-if="item.type === 'text'"> {{ item.value }}</span>
            <image v-else class="msg-emoji" :src="item.value" />
          </span>
        </span>
      </view>
    </view>
    <view v-if="msg" class="quote-msg">
      <ImageMessage
        v-if="msg.type === 'img'"
        :msg="msg"
        mode="scaleToFill"
        :width="40"
        :height="40"
        :disabledPreview="props.isReplying"
      />
      <VideoMessage
        v-else-if="msg.type === 'video'"
        :msg="msg"
        mode="scaleToFill"
        :width="40"
        :height="40"
        :disabledPreview="props.isReplying"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { renderTxt } from "../../../../utils/index";
import { ref, computed, onUnmounted, CSSProperties } from "vue";
import { formatMessage, deepClone } from "../../../../utils/index";
import { ChatUIKit } from "../../../../index";
import { t } from "../../../../locales/index";
import ImageMessage from "./messageImage.vue";
import VideoMessage from "./messageVideo.vue";
import { MessageQuoteExt } from "../../../../types/index";
import { autorun } from "mobx";

interface Props {
  msgId?: string; // 存在msgId时，根据msgId获取消息, 否则获取quoteMessage
  isReplying?: boolean; // 是否是回复消息
  messageQuoteExt?: MessageQuoteExt;
  titleStyle?: CSSProperties;
}

const props = defineProps<Props>();

const quoteFrom = ref(null);

const msg = ref(null);

const emits = defineEmits(["jumpToMessage"]);

const jumpToMessage = () => {
  if (msg.value) {
    emits("jumpToMessage", msg.value.id);
  }
};

const data = computed(() => {
  if (!msg.value) {
    return renderTxt(t("messageNotFound"));
  }
  return renderTxt(formatMessage(msg.value));
});

const unwatchQuoteMsg = autorun(() => {
  // 展示引用消息
  if (props.msgId) {
    msg.value =
      deepClone(ChatUIKit.messageStore.messageMap.get(props.msgId)) || null;

    if (!msg.value) {
      // 保持和 getUserInfoFromStore数据结构一致
      quoteFrom.value = {
        nickname: props.messageQuoteExt.msgSender
      };
      return;
    }

    quoteFrom.value = ChatUIKit.appUserStore.getUserInfoFromStore(
      msg.value.from
    );
  } else {
    msg.value = deepClone(ChatUIKit.messageStore?.quoteMessage) || null;
    if (!msg.value) {
      return;
    }
    quoteFrom.value = ChatUIKit.appUserStore.getUserInfoFromStore(
      msg.value.from
    );
  }
});

const you = t("you");
const reply = t("reply");

onUnmounted(() => {
  unwatchQuoteMsg();
});
</script>

<style lang="scss" scoped>
.msg-quote-wrap {
  display: inline-flex;
  align-items: center;
  background: #f1f2f3;
  padding: 8px 12px;
  border-radius: 4px;
  flex: 1;
}

.title {
  display: flex;
  font-size: 12px;
  line-height: 16px;
  color: #5270ad;
  white-space: nowrap;
  overflow: hidden;
}

.user {
  font-weight: 500;
}

.content {
  color: #75828a;
  font-size: 12px;
  line-height: 16px;
  margin-top: 4px;
}

.tip {
  margin: 0 2px;
}

.cancel {
  width: 20px;
  height: 20px;
  background-image: url("../../../../assets//icon/cancel.png");
  background-size: 100%;
}

.quote-brief {
  flex: 1;
}

.msg {
  display: inline-block;
  height: 18px;
  max-width: calc(80vw - 50px);
}

.emoji-wrap {
  vertical-align: middle;
}

.quote-msg {
  margin-left: 12px;
}

@import url("../../../../styles/common.scss");
</style>
