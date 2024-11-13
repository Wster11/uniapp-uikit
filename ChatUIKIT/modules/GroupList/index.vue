<template>
  <view class="group-list-wrap">
    <view v-if="groupList.length">
      <view
        class="group-item"
        v-for="group in groupList"
        :key="group.groupId"
        @click="toChatPage(group.groupId)"
      >
        <GroupItem :group="group" />
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import GroupItem from "./components/GroupItem/index.vue";
import Empty from "../common/Empty/index.vue";
import type { Chat } from "../../sdk";
import { ChatUIKIT } from "../../index";
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";

const groupList = ref<Chat.ContactItem[]>([]);

const unwatchGroupList = autorun(() => {
  groupList.value = ChatUIKIT.groupStore.joinedGroupList;
});

const toChatPage = (id: string) => {
  uni.navigateTo({
    url: `/ChatUIKIT/modules/Chat/index?type=groupChat&id=${id}`
  });
};

onUnmounted(() => {
  unwatchGroupList();
});
</script>

<style lang="scss" scoped>
.group-list-wrap {
  display: flex;
  flex-direction: column;
}
</style>
