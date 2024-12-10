<template>
  <view class="group-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view v-text="t('groupList')"></view>
      </template>
    </NavBar>
    <view class="list" v-if="groupList.length">
      <view
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
import Empty from "../../components/Empty/index.vue";
import NavBar from "../../components/NavBar/index.vue";
import type { Chat } from "../../sdk";
import { ChatUIKit } from "../../index";
import { ref, onUnmounted } from "vue";
import { t } from "../../locales/index";
import { autorun } from "mobx";

const groupList = ref<Chat.GroupInfo[]>([]);

const onBack = () => {
  uni.navigateBack();
};

const unwatchGroupList = autorun(() => {
  groupList.value = ChatUIKit.groupStore.joinedGroupList;
});

const toChatPage = (id: string) => {
  uni.navigateTo({
    url: `/ChatUIKit/modules/Chat/index?type=groupChat&id=${id}`
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
  height: 100%;
  overflow: hidden;
}

.list {
  flex: 1;
  padding-right: 16px;
  overflow-y: scroll;
}
</style>
