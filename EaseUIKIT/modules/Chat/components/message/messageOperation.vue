<template>
  <view class="msg-operation" :style="isSelf ? { right: 0 } : { left: 0 }">
    <view class="content">
      <view class="msg-operate-item" @tap="emitRecall">
        {{ t("recall") }}
      </view>
      <!-- <view class="msg-operate-item"> 举报 </view> -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { MixedMessageBody } from "../../../../types/index";
import { t } from "../../../../locales/index";
import { EaseConnKit } from "../../../../";
interface Props {
  msg: MixedMessageBody;
  isSelf: boolean;
}
const emits = defineEmits(["onFinished"]);

const props = defineProps<Props>();
const { msg, isSelf } = props;

const emitRecall = () => {
  EaseConnKit.messageStore
    //@ts-ignore
    .recallMessage({
      mid: msg.id,
      to: EaseConnKit.convStore.getCvsIdFromMessage(msg),
      chatType: msg.chatType
    })
    .catch((e) => {
      uni.showToast({
        title: `${t("recallFailed")} ${e.message}`,
        icon: "none"
      });
    })
    .finally(() => {
      emits("onFinished");
    });
};
</script>

<style lang="scss" scoped>
.msg-operation {
  position: absolute;
  z-index: 99;
  background: rgba(0, 0, 0, 0.7);
  padding: 0 0.625rem;
  bottom: -55rpx;
  border-radius: 10rpx;
  color: #fff;
  font-size: 28rpx;
}

.content {
  display: flex;
  align-items: center;
}
.msg-operate-item {
  margin: 0 10rpx;
  flex-shrink: 0;
}
</style>
