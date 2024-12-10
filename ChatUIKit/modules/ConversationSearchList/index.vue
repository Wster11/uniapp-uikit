<template>
  <view class="search-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="input-wrap">
          <SearchInput
            ref="searchRef"
            :placeholder="t('conversationSearchPlaceholder')"
            @input="onInput"
            @cancel="cancelSearch"
          />
        </view>
      </template>
    </NavBar>
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
            ChatUIKit.groupStore.getGroupInfoFromStore(item.conversationId)
          "
        />
        <UserItem v-else :user="{ userId: item.conversationId }" />
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../components/NavBar/index.vue";
import SearchInput from "../../components/SearchInput/index.vue";
import GroupItem from "../GroupList/components/GroupItem/index.vue";
import UserItem from "../ContactList/components/UserItem/index.vue";
import Empty from "../../components/Empty/index.vue";
import { ChatUIKit } from "../../index";
import { t } from "../../locales";
import { ref, computed } from "vue";

const searchValue = ref("");
const searchRef = ref(null);

const onInput = (value: string) => {
  searchValue.value = value;
};

const searchList = computed(() => {
  if (!searchValue.value) {
    return [];
  }
  return ChatUIKit.convStore.conversationList.filter((item) => {
    if (item.conversationType === "singleChat") {
      return ChatUIKit.appUserStore
        .getUserInfoFromStore(item.conversationId)
        .name.includes(searchValue.value);
    } else {
      return ChatUIKit.groupStore
        .getGroupInfoFromStore(item.conversationId)
        ?.groupName.includes(searchValue.value);
    }
  });
});

const cancelSearch = () => {
  uni.redirectTo({
    url: "/ChatUIKit/modules/Conversation/index"
  });
};

const onBack = () => {
  uni.navigateBack();
};

const toChatPage = (item) => {
  uni.redirectTo({
    url: `/ChatUIKit/modules/Chat/index?id=${item.conversationId}&type=${item.conversationType}`
  });
};
</script>

<style lang="scss" scoped>
.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.search-item {
  box-sizing: border-box;
  padding-right: 16px;
}

.input-wrap {
  /*  #ifndef MP-WEIXIN  */
  width: calc(100vw - 50px);
  /*  #endif  */
  /*  #ifdef MP-WEIXIN  */
  width: calc(100vw - 150px);
  /*  #endif  */
}

.search-list-wrap {
  height: calc(100% - var(--status-bar-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 5px;
}
</style>
