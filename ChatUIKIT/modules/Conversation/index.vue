<template>
  <ConversationList />
</template>

<script lang="ts" setup>
import ConversationList from "./components/ConversationList/index.vue";
import { ChatUIKIT } from "../../index";
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";

const connState = ref("");

const unwatchConnState = autorun(() => {
  connState.value = ChatUIKIT.chatStore.connState;
  console.log("IM Connection State: ", connState.value);
});

onUnmounted(() => {
  unwatchConnState();
});
</script>

<style lang="scss" scoped>
@import "../../styles/common.scss";
</style>
