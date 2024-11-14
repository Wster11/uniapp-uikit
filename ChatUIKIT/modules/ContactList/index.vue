<template>
  <view class="contact-list-wrap">
    <SearchButton @tap="toSearchPage" class="contact-search" />
    <IndexedList class="contact-index-list" :options="contactList">
      <template v-slot:header>
        <MenuItem class="contact-menu" :title="t('newRequest')" />
        <MenuItem
          @tap="toGroupPage"
          class="contact-menu"
          :title="t('groupList')"
        >
          <view class="count" v-if="joinedGroupCount">
            {{ joinedGroupCount }}
          </view>
        </MenuItem>
      </template>
      <template v-slot:indexedItem="slotProps">
        <UserItem
          class="contact-item"
          :user="slotProps.item"
          @tap="toChatPage(slotProps.item.userId)"
        />
      </template>
    </IndexedList>
  </view>
</template>

<script setup lang="ts">
import SearchButton from "../../modules/common/SearchButton/index.vue";
import MenuItem from "./components/MenuItem/index.vue";
import UserItem from "./components/UserItem/index.vue";
import IndexedList from "../common/IndexedList/index.vue";
import type { Chat } from "../../sdk";
import { t } from "../../locales/index";
import { ChatUIKIT } from "../../index";
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";

const contactList = ref<Chat.ContactItem[]>([]);
const joinedGroupCount = ref(0);

const unwatchContactList = autorun(() => {
  contactList.value = ChatUIKIT.contactStore.contacts.map((contact) => ({
    ...contact,
    ...ChatUIKIT.appUserStore.getUserInfoFromStore(contact.userId),
    id: contact.userId
  }));
});

const unwatchJoinedGroupCount = autorun(() => {
  joinedGroupCount.value = ChatUIKIT.groupStore.joinedGroupList.length;
});

const toChatPage = (id: string) => {
  uni.navigateTo({
    url: `/ChatUIKIT/modules/Chat/index?type=singleChat&id=${id}`
  });
};

const toGroupPage = () => {
  uni.navigateTo({
    url: `/ChatUIKIT/modules/GroupList/index`
  });
};

const toSearchPage = () => {
  uni.navigateTo({
    url: `/ChatUIKIT/modules/ContactSearchList/index`
  });
};

onUnmounted(() => {
  unwatchContactList();
  unwatchJoinedGroupCount();
});
</script>

<style lang="scss" scoped>
@import "./style.scss";
</style>
