<template>
  <view class="search-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="input-wrap">
          <SearchInput
            ref="searchRef"
            :placeholder="t('searchContact')"
            @input="onInput"
            @cancel="cancelSearch"
          />
        </view>
      </template>
    </NavBar>
    <view class="search-content" v-if="searchList.length">
      <view class="search-item">
        <UserItem
          v-for="item in searchList"
          :key="item.conversationId"
          @tap="toChatPage(item)"
          :user="{ userId: item.userId }"
        />
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../components/NavBar/index.vue";
import SearchInput from "../../components/SearchInput/index.vue";
import UserItem from "../ContactList/components/UserItem/index.vue";
import Empty from "../../components/Empty/index.vue";
import { ChatUIKit } from "../../index";
import { t } from "../../locales";
import { onLoad } from "@dcloudio/uni-app";
import { ref, computed } from "vue";

const searchValue = ref("");
const searchRef = ref(null);

let sourceUrl = "";

const emits = defineEmits(["on"]);

const onInput = (value: string) => {
  searchValue.value = value;
};

const searchList = computed(() => {
  if (!searchValue.value) {
    return [];
  }
  return ChatUIKit.contactStore.contacts.filter((item) => {
    return ChatUIKit.appUserStore
      .getUserInfoFromStore(item.userId)
      .name.includes(searchValue.value);
  });
});

const cancelSearch = () => {
  // 如果有来源页面，则返回来源页面，否则返回上一页
  if (sourceUrl) {
    uni.redirectTo({
      url: sourceUrl
    });
  } else {
    uni.navigateBack();
  }
};

const toChatPage = (item) => {
  uni.redirectTo({
    url: `/ChatUIKit/modules/Chat/index?id=${item.userId}&type=singleChat`
  });
};

const onBack = () => {
  uni.navigateBack();
};

onLoad((option) => {
  sourceUrl = option.url;
});
</script>

<style lang="scss" scoped>
.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: scroll;
}

.search-item {
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
