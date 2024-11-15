<template>
  <view class="search-list-wrap">
    <view class="search-wrap">
      <SearchInput
        :focus="true"
        :placeholder="t('conversationSearchPlaceholder')"
        @input="onInput"
        @cancel="cancelSearch"
      />
    </view>
    <view class="search-content" v-if="searchList.length">
      <view
        class="search-item"
        v-for="item in searchList"
        :key="item.conversationId"
        @click="toChatPage(item)"
      >
        <GroupItem
          v-if="item.conversationType === 'groupChat'"
          :group="
            ChatUIKIT.groupStore.getGroupInfoFromStore(item.conversationId)
          "
        />
        <UserItem v-else :user="{ userId: item.conversationId }" />
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import SearchInput from "../common/SearchInput/index.vue";
import GroupItem from "../GroupList/components/GroupItem/index.vue";
import UserItem from "../ContactList/components/UserItem/index.vue";
import Empty from "../common/Empty/index.vue";
import { ChatUIKIT } from "../../index";
import { t } from "../../locales";
import { ref, computed } from "vue";

const searchValue = ref("");

const onInput = (value: string) => {
  searchValue.value = value;
};

const searchList = computed(() => {
  if (!searchValue.value) {
    return [];
  }
  return ChatUIKIT.convStore.conversationList.filter((item) => {
    if (item.conversationType === "singleChat") {
      return ChatUIKIT.appUserStore
        .getUserInfoFromStore(item.conversationId)
        .name.includes(searchValue.value);
    } else {
      return ChatUIKIT.groupStore
        .getGroupInfoFromStore(item.conversationId)
        ?.groupName.includes(searchValue.value);
    }
  });
});

const cancelSearch = () => {
  uni.switchTab({
    url: "/ChatUIKIT/modules/Conversation/index"
  });
};

const toChatPage = (item) => {
  uni.redirectTo({
    url: `/ChatUIKIT/modules/Chat/index?id=${item.conversationId}&type=${item.conversationType}`
  });
};
</script>

<style lang="scss" scoped>
.search-wrap {
  flex-shrink: 0;
  padding: 7px 20px 7px 7px;
}

.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.search-item {
  box-sizing: border-box;
}

.search-list-wrap {
  height: calc(100vh - var(--status-bar-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: var(--status-bar-height);
}
</style>
