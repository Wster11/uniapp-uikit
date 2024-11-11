<template>
  <view class="contact-list-wrap">
    <SearchButton class="contact-search" />
    <MenuItem class="contact-menu" :title="t('groupList')" />
    <MenuItem class="contact-menu" :title="t('contact')" />
    <view class="items-wrap">
      <ContactItem
        class="item-wrap"
        v-for="contact in contactList"
        :key="contact.userId"
        :contact="contact"
      >
      </ContactItem>
    </view>
  </view>
</template>

<script setup lang="ts">
import SearchButton from "../../modules/common/searchButton/index.vue";
import MenuItem from "./components/menuItem/index.vue";
import ContactItem from "./components/contactItem/index.vue";
import type { Chat } from "../../sdk";
import { t } from "../../locales/index";
import { ChatUIKIT } from "../../index";
import { ref } from "vue";
import { autorun } from "mobx";

const contactList = ref<Chat.ContactItem[]>([]);
const isShowSearchPanel = ref(false);

const unwatchContactList = autorun(() => {
  contactList.value = ChatUIKIT.contactStore.contacts;
  console.log("contactList", contactList.value);
});

const { setViewedUserInfo } = ChatUIKIT.contactStore;

const searchContact = () => {
  isShowSearchPanel.value = true;
};

const onSearchCancel = () => {
  isShowSearchPanel.value = false;
};

const toGroupList = () => {};
</script>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
