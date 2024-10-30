<template>
  <view v-if="showConnState" class="conn-state">{{ connState }}</view>
  <ConversationList />
</template>

<script lang="ts" setup>
import ConversationList from "./components/conversationList/index.vue";
import { EaseConnKit } from "../../index";
import { ref, onUnmounted, computed } from "vue";
import { autorun } from "mobx";

const connState = ref("");

const unwatchConnState = autorun(() => {
  connState.value = EaseConnKit.chatStore.connState;
});

const showConnState = computed(() => {
  if (connState.value === "none") {
    return false;
  } else if (connState.value === "connected") {
    return false;
  } else {
    return true;
  }
});

onUnmounted(() => {
  unwatchConnState();
});
</script>

<style lang="scss" scoped>
.conn-state {
  width: 100%;
  height: 30px;
  background-color: #faeeed;
  color: #a09894;
  font-size: 14px;
  text-align: center;
  line-height: 30px;
}
@import "../../styles/common.scss";
</style>
