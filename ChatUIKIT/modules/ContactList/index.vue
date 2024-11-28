<template>
  <view class="contact-list-wrap">
    <view class="header-wrap">
      <ContactNav />
      <SearchButton @tap="toSearchPage" class="contact-search" />
    </view>
    <!-- nav占位 -->
    <view :class="isWXProgram ? 'wx-block' : 'block'"></view>
    <IndexedList class="contact-index-list" :options="contactList">
      <template v-slot:header>
        <view class="contact-menu-wrap">
          <MenuItem
            @tap="toRequestListPage"
            class="contact-menu"
            :title="t('newRequest')"
          >
            <template v-slot:right>
              <view class="request-count" v-if="contactRequestCount">
                {{ contactRequestCount > 99 ? "99+" : contactRequestCount }}
              </view>
            </template>
          </MenuItem>

          <MenuItem
            @tap="toGroupPage"
            class="contact-menu"
            :title="t('groupList')"
          >
            <template v-slot:right>
              <view class="count" v-if="joinedGroupCount">
                {{ joinedGroupCount }}
              </view>
            </template>
          </MenuItem>
        </view>
      </template>
      <template v-slot:indexedItem="slotProps">
        <UserItem
          :user="slotProps.item"
          @tap="toChatPage(slotProps.item.userId)"
        />
      </template>
    </IndexedList>
  </view>
</template>

<script setup lang="ts">
import SearchButton from "../../components/SearchButton/index.vue";
import MenuItem from "../../components/MenuItem/index.vue";
import UserItem from "./components/UserItem/index.vue";
import IndexedList from "../../components/IndexedList/index.vue";
import ContactNav from "./components/ContactNav/index.vue";
import type { Chat } from "../../sdk";
import { t } from "../../locales/index";
import { ChatUIKIT } from "../../index";
import { ref, onUnmounted } from "vue";
import { isWXProgram } from "../../utils/index";
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

<style lang="scss" scoped>
.contact-menu-wrap {
  display: flex;
  flex-direction: column;
}
.contact-menu {
  padding-left: 16px;
}

.block {
  height: 104px;
}

.wx-block {
  height: 151px;
}
</style>

<style lang="scss" scoped>
@import "./style.scss";
</style>
