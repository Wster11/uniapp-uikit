<template>
  <view v-if="quoteMsg" class="msg-quote-panel-wrap">
    <view class="left-wrap">
      <MessageQuote class="msg-quote-wrap" :isReplying="true" />
    </view>
    <view class="cancel" @tap="cancelQuote"> </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import { ChatUIKit } from "../../../../index";
import MessageQuote from "./messageQuote.vue";
import { autorun } from "mobx";

const quoteMsg = ref(null);

autorun(() => {
  quoteMsg.value = ChatUIKit.messageStore.quoteMessage;
});

const cancelQuote = () => {
  ChatUIKit.messageStore.setQuoteMessage(null);
};

onUnmounted(() => {
  cancelQuote();
});
</script>

<style lang="scss" scoped>
.msg-quote-panel-wrap {
  display: flex;
  align-items: center;
  background: #f1f2f3;
}

.cancel {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  background-image: url("../../../../assets//icon/cancel.png");
  background-size: 100%;
}

.msg-quote-wrap {
  display: flex;
  width: 100%;
}

.left-wrap {
  display: flex;
  flex: 1;
}

@import url("../../../../styles/common.scss");
</style>
