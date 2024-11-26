<template>
  <view class="group-create-wrap">
    <view v-if="!isSearch">
      <NavBar @onLeftTap="onBack">
        <template v-slot:left>
          <view class="title" v-text="t('createGroup')"></view>
        </template>
      </NavBar>
      <view class="search-wrap" @tap="isSearch = true">
        <SearchButton :placeholder="t('searchContact')" />
      </view>
      <IndexedList
        v-if="contactList.length"
        class="contact-indexed-list"
        :checkedList="selectedUserIds"
        :options="contactList"
        :withCheckbox="true"
        @checkboxChange="onCheckboxChange"
      >
        <template v-slot:indexedItem="slotProps">
          <UserItem class="contact-item" :user="slotProps.item" />
        </template>
      </IndexedList>
      <Empty v-else />
      <view class="create-btn-wrap">
        <UIKITButton
          class="crate-btn"
          :disabled="!selectedUserIds.length"
          @tap="createGroup"
        >
          {{ t("createGroupBtn") + "(" + selectedUserIds.length + ")" }}
        </UIKITButton>
      </view>
    </view>
    <SearchList
      v-else
      :checkedList="selectedUserIds"
      @checkboxChange="onCheckboxChange"
      @cancel="isSearch = false"
    />
  </view>
</template>

<script setup lang="ts">
import SearchButton from "../../components/SearchButton/index.vue";
import NavBar from "../../components/NavBar/index.vue";
import UserItem from "../ContactList/components/UserItem/index.vue";
import Empty from "../../components/Empty/index.vue";
import IndexedList from "../../components/IndexedList/index.vue";
import UIKITButton from "../../components/Button/index.vue";
import SearchList from "./searchList.vue";
import { ChatUIKIT } from "../../index";
import { t } from "../../locales";
import { Chat } from "../../sdk";
import { autorun } from "mobx";
import { ref, onUnmounted } from "vue";

const contactList = ref<Chat.ContactItem[]>([]);
const isSearch = ref(false);

const selectedUserIds = ref([]);

const unwatchContactList = autorun(() => {
  contactList.value = ChatUIKIT.contactStore.contacts.map((contact) => ({
    ...contact,
    ...ChatUIKIT.appUserStore.getUserInfoFromStore(contact.userId),
    id: contact.userId
  }));
});

const onCheckboxChange = (values) => {
  selectedUserIds.value = values;
};

const createGroup = () => {
  if (!selectedUserIds.value.length) {
    return;
  }
  let groupName = selectedUserIds.value
    .map((userId) => ChatUIKIT.appUserStore.getUserInfoFromStore(userId).name)
    .join("、");
  // 群组名字为当前用户的名字加上选中的用户的名字
  groupName = ChatUIKIT.appUserStore.getSelfUserInfo().name + "、" + groupName;
  const params = {
    groupname: groupName,
    members: selectedUserIds.value,
    desc: groupName,
    public: true,
    allowinvites: true,
    inviteNeedConfirm: false,
    approval: false, // 无需审批即可加入群组
    maxusers: 1000
  };
  uni.showLoading({
    title: "loading",
    mask: true
  });
  ChatUIKIT.groupStore
    .createGroup({
      data: params
    })
    .then((res) => {
      uni.redirectTo({
        url: `/ChatUIKIT/modules/Chat/index?type=groupChat&id=${res.data?.groupid}`
      });
    })
    .finally(() => {
      uni.hideLoading();
    });
};

const onBack = () => {
  uni.switchTab({
    url: "/ChatUIKIT/modules/Conversation/index"
  });
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

.arrow-left {
  width: 24px;
  height: 24px;
  background: url("../../assets/icon/arrow-left.png") no-repeat;
  background-size: 100% 100%;
}

.search-wrap {
  flex-shrink: 0;
  padding: 7px 8px;
}

.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.search-item {
  box-sizing: border-box;
}

.group-create-wrap {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contact-indexed-list {
  display: flex;
  height: calc(100vh - 200px);
}

.create-btn-wrap {
  display: flex;
  padding: 14px;
  align-items: center;
  border-top: 0.5px solid #e3e6e8;
  background: #f9fafa;
  backdrop-filter: blur(10px);
}

.crate-btn {
  width: 100%;
}
</style>
