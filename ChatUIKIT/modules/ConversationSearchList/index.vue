<template>
  <view class="search-list-wrap">
    <view class="search-wrap">
      <SearchInput :focus="true" @input="onInput" @cancel="cancelSearch" />
    </view>
    <view v-if="searchList.length">
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
    url: "../Conversation/index"
  });
};

const toChatPage = (item) => {
  uni.redirectTo({
    url: `../Chat/index?id=${item.conversationId}&type=${item.conversationType}`
  });
};
</script>

<style lang="scss" scoped>
.search-wrap {
  padding: 7px 20px 7px 7px;
}

.search-list-wrap {
  display: flex;
  flex-direction: column;
  /*  #ifndef WEB  */
  margin-top: 44px;
  /*  #endif  */
}
</style>
