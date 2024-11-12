<template>
  <view class="contact-list-wrap">
    <SearchButton class="contact-search" />
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
        <ContactItem
          :contact="slotProps.item"
          @tap="toChatPage(slotProps.item.userId)"
        />
      </template>
    </IndexedList>
  </view>
</template>

<script setup lang="ts">
import SearchButton from "../../modules/common/searchButton/index.vue";
import MenuItem from "./components/menuItem/index.vue";
import ContactItem from "./components/contactItem/index.vue";
import IndexedList from "../common/indexedList/index.vue";
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
    url: `../../modules/Chat/index?type=singleChat&id=${id}`
  });
};

const toGroupPage = () => {
  uni.navigateTo({
    url: `../../modules/GroupList/index`
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
