<template>
  <view class="new-chat-wrap">
    <view>
      <NavBar @onLeftTap="onBack">
        <template v-slot:left>
          <view class="title" v-text="t('newChatTitle')"></view>
        </template>
      </NavBar>
      <view class="search-wrap" @tap="toContactSearch">
        <SearchButton :placeholder="t('searchContact')" />
      </view>
    </view>
    <IndexedList
      v-if="contactList.length"
      class="contact-indexed-list"
      :options="contactList"
    >
      <template v-slot:indexedItem="slotProps">
        <UserItem @tap="toChatPage(slotProps.item)" :user="slotProps.item" />
      </template>
    </IndexedList>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import SearchButton from "../../components/SearchButton/index.vue";
import NavBar from "../../components/NavBar/index.vue";
import UserItem from "../ContactList/components/UserItem/index.vue";
import Empty from "../../components/Empty/index.vue";
import IndexedList from "../../components/IndexedList/index.vue";
import { ChatUIKIT } from "../../index";
import { t } from "../../locales";
import { Chat } from "../../sdk";
import { autorun } from "mobx";
import { ref, onUnmounted } from "vue";

const contactList = ref<Chat.ContactItem[]>([]);

const toContactSearch = () => {
  uni.redirectTo({
    url: "/ChatUIKIT/modules/ContactSearchList/index?url=/ChatUIKIT/modules/ChatNew/index"
  });
};

const toChatPage = (item: Chat.ContactItem) => {
  uni.redirectTo({
    url: `/ChatUIKIT/modules/Chat/index?type=singleChat&id=${item.userId}`
  });
};

const unwatchContactList = autorun(() => {
  contactList.value = ChatUIKIT.contactStore.contacts.map((contact) => ({
    ...contact,
    ...ChatUIKIT.appUserStore.getUserInfoFromStore(contact.userId),
    id: contact.userId
  }));
});

const onBack = () => {
  uni.navigateBack();
};

onUnmounted(() => {
  unwatchContactList;
});
</script>

<style lang="scss" scoped>
.nav-tar-wrap {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  justify-content: space-between;
}

.title {
  color: #171a1c;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
}

.search-wrap {
  flex-shrink: 0;
  padding: 7px 8px;
}

.new-chat-wrap {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contact-indexed-list {
  flex: 1;
  overflow-y: scroll;
}
</style>
