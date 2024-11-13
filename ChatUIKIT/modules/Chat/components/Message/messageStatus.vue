<template>
  <view class="msg-status-wrap">
    <view
      v-if="props.msg.status === 'sending'"
      class="msg-status sending"
    ></view>
    <view
      v-else-if="props.msg.status === 'sent'"
      class="msg-status sent"
    ></view>
    <view
      v-else-if="props.msg.status === 'failed'"
      class="msg-status failed"
    ></view>
    <view
      v-else-if="props.msg.status === 'received'"
      class="msg-status received"
    ></view>
    <view
      v-else-if="props.msg.status === 'read'"
      class="msg-status read"
    ></view>
  </view>
</template>

<script lang="ts" setup>
import { MixedMessageBody } from "../../../../types";

interface Props {
  msg: MixedMessageBody;
}
const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.msg-status-wrap {
  position: absolute;
  display: inline-block;
  left: -24px;
  bottom: 0px;
}

.msg-status {
  width: 20px;
  height: 20px;
}

.sending {
  background-position: center center;
  background-image: url("../../../../assets/icon/spinner.png");
  background-size: 100%;
  animation: spin 1s linear infinite;
  background-repeat: no-repeat;
}

.sent {
  background-position: center center;
  background-image: url("../../../../assets/icon/check.png");
  background-size: 100%;
  background-repeat: no-repeat;
}

.failed {
  background-position: center center;
  background-image: url("../../../../assets/icon/failed.png");
  background-size: 100%;
  background-repeat: no-repeat;
}

.received {
  background-position: center center;
  background-image: url("../../../../assets/icon/received.png");
  background-size: 100%;
  background-repeat: no-repeat;
}

.read {
  background-position: center center;
  background-image: url("../../../../assets/icon/read.png");
  background-size: 100%;
  background-repeat: no-repeat;
}

@import url("../../../../styles/common.scss");
</style>
