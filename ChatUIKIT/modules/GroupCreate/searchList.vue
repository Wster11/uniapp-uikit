<template>
  <view class="search-list-wrap">
    <NavBar @onLeftTap="cancelSearch">
      <template v-slot:left>
        <view class="input-wrap">
          <SearchInput
            :focus="true"
            :placeholder="t('searchContact')"
            @input="onInput"
            @cancel="cancelSearch"
          />
        </view>
      </template>
    </NavBar>

    <view class="search-content" v-if="searchList.length">
      <checkbox-group @change="checkboxChange">
        <label
          class="label"
          v-for="item in contacts"
          v-show="searchList.includes(item.userId)"
        >
          <checkbox
            class="checkbox"
            :value="item.userId"
            :checked="props.checkedList.includes(item.userId)"
          />
          <UserItem
            :key="item.conversationId"
            class="search-item"
            :user="{ userId: item.userId }"
          />
        </label>
      </checkbox-group>
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import NavBar from "../common/NavBar/index.vue";
import SearchInput from "../common/SearchInput/index.vue";
import UserItem from "../ContactList/components/UserItem/index.vue";
import Empty from "../common/Empty/index.vue";
import { ChatUIKIT } from "../../index";
import { t } from "../../locales";
import { ref, computed, onUnmounted } from "vue";
import { autorun } from "mobx";

interface Props {
  checkedList: string[];
}

const props = defineProps<Props>();

const emits = defineEmits(["checkboxChange", "cancel"]);

const contacts = ref([]);

const searchValue = ref("");

const unwatchContactList = autorun(() => {
  contacts.value = ChatUIKIT.contactStore.contacts;
});

const onInput = (value: string) => {
  searchValue.value = value;
};

const checkboxChange = (e) => {
  const values = e.detail.value;
  emits("checkboxChange", values);
};

const searchList = computed(() => {
  if (!searchValue.value) {
    return [];
  }
  return contacts.value
    .filter((item) => {
      return ChatUIKIT.appUserStore
        .getUserInfoFromStore(item.userId)
        .name.includes(searchValue.value);
    })
    .map((mapItem) => mapItem.userId);
});

const cancelSearch = () => {
  emits("cancel");
};

onUnmounted(() => {
  unwatchContactList();
});
</script>

<style lang="scss" scoped>
.label {
  display: flex;
  width: 100%;
  align-items: center;
}

.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-left: 16px;
}

.search-item {
  box-sizing: border-box;
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
  height: calc(100vh - var(--status-bar-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 5px;
}
</style>
