<template>
  <view class="contact-list-wrap">
    <SearchButton class="contact-search" />
    <MenuItem class="contact-menu" :title="t('groupList')" />
    <MenuItem class="contact-menu" :title="t('contact')" />
    <IndexedList class="contact-index-list" :options="contactList">
      <template v-slot:default="slotProps">
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

// 使用合适的类型注解来初始化 contactList
const contactList = ref<Chat.ContactItem[]>([]);

// 优化 MobX 自动运行逻辑
const unwatchContactList = autorun(() => {
  contactList.value = ChatUIKIT.contactStore.contacts.map((contact) => ({
    ...contact,
    ...ChatUIKIT.appUserStore.getUserInfoFromStore(contact.userId),
    id: contact.userId
  }));
});

const toChatPage = (contactId: string) => {
  uni.navigateTo({
    url: `../../modules/Chat/index?type=singleChat&id=${contactId}`
  });
};

onUnmounted(() => {
  unwatchContactList();
});
</script>

<style lang="scss" scoped>
@import "./style.scss";
</style>
