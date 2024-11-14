<template>
  <view class="search-list-wrap">
    <view class="search-wrap">
      <SearchInput
        :focus="true"
        :placeholder="t('searchContact')"
        @input="onInput"
        @cancel="cancelSearch"
      />
    </view>
    <view class="search-content" v-if="searchList.length">
      <UserItem
        v-for="item in searchList"
        :key="item.conversationId"
        @tap="toChatPage(item)"
        class="search-item"
        :user="{ userId: item.userId }"
      />
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import SearchInput from "../common/SearchInput/index.vue";
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
  return ChatUIKIT.contactStore.contacts.filter((item) => {
    return ChatUIKIT.appUserStore
      .getUserInfoFromStore(item.userId)
      .name.includes(searchValue.value);
  });
});

const cancelSearch = () => {
  uni.switchTab({
    url: "/ChatUIKIT/modules/ContactList/index"
  });
};

const toChatPage = (item) => {
  uni.redirectTo({
    url: `/ChatUIKIT/modules/Chat/index?id=${item.userId}&type=singleChat`
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
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /*  #ifndef WEB  */
  padding-top: 44px;
  height: calc(100vh - 44px);
  /*  #endif  */
}
</style>
