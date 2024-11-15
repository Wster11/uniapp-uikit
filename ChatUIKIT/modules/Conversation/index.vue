<template>
  <view v-if="showConnState" class="conn-state">{{ connState }}</view>
  <ConversationList />
</template>

<script lang="ts" setup>
import ConversationList from "./components/ConversationList/index.vue";
import { ChatUIKIT } from "../../index";
import { ref, onUnmounted, computed } from "vue";
import { autorun } from "mobx";

const connState = ref("");

const unwatchConnState = autorun(() => {
  connState.value = ChatUIKIT.chatStore.connState;
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
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 44px;
  background-color: #faeeed;
  color: #a09894;
  font-size: 14px;
  text-align: center;
  line-height: 44px;
}
@import "../../styles/common.scss";
</style>
