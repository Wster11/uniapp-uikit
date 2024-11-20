<template>
  <view class="contact-list-wrap">
    <view class="header-wrap">
      <ContactNav />
      <SearchButton @tap="toSearchPage" class="contact-search" />
    </view>
    <IndexedList class="contact-index-list" :options="contactList">
      <template v-slot:header>
        <MenuItem @tap="toRequestListPage" :className="'contact-menu'" :title="t('newRequest')">
          <template v-slot:right>
            <view class="request-count" v-if="contactRequestCount">
              {{ contactRequestCount > 99 ? "99+" : contactRequestCount }}
            </view>
          </template>
        </MenuItem>

        <MenuItem
          @tap="toGroupPage"
          :className="'contact-menu'"
          :title="t('groupList')"
        >
          <template v-slot:right>
            <view class="count" v-if="joinedGroupCount">
              {{ joinedGroupCount }}
            </view>
          </template>
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
import MenuItem from "../common/MenuItem/index.vue";
import UserItem from "./components/UserItem/index.vue";
import IndexedList from "../common/IndexedList/index.vue";
import ContactNav from "./components/ContactNav/index.vue";
import type { Chat } from "../../sdk";
import { t } from "../../locales/index";
import { ChatUIKIT } from "../../index";
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";

const contactList = ref<Chat.ContactItem[]>([]);
const joinedGroupCount = ref(0);
const contactRequestCount = ref(0);

const unwatchContactRequestCount = autorun(() => {
  contactRequestCount.value =
    ChatUIKIT.contactStore.contactsNoticeInfo.unReadCount;
});

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


const toRequestListPage = () => {
  uni.navigateTo({
    url: `/ChatUIKIT/modules/ContactRequestList/index`
  });
};

const toCreateGroup = () => {
  uni.navigateTo({
    url: `/ChatUIKIT/modules/GroupCreate/index`
  });
};

onUnmounted(() => {
  unwatchContactList();
  unwatchContactRequestCount();
  unwatchJoinedGroupCount();
});
</script>

<style lang="scss">
.contact-menu {
  padding-left: 16px;
}
</style>

<style lang="scss" scoped>
@import "./style.scss";
</style>
