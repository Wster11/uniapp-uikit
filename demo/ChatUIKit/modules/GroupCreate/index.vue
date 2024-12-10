<template>
  <view class="group-create-wrap">
    <view class="group-create-content" v-if="!isSearch">
      <NavBar class="nav-bar" @onLeftTap="onBack">
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
      <view class="empty-wrap" v-else>
        <Empty />
      </view>
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
      class="search-list-comp"
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
import { ChatUIKit } from "../../index";
import { t } from "../../locales";
import { Chat } from "../../sdk";
import { autorun } from "mobx";
import { ref, onUnmounted } from "vue";

const contactList = ref<Chat.ContactItem[]>([]);
const isSearch = ref(false);

const selectedUserIds = ref([]);

const unwatchContactList = autorun(() => {
  contactList.value = ChatUIKit.contactStore.contacts.map((contact) => ({
    ...contact,
    ...ChatUIKit.appUserStore.getUserInfoFromStore(contact.userId),
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
    .map((userId) => ChatUIKit.appUserStore.getUserInfoFromStore(userId).name)
    .join("、");
  // 群组名字为当前用户的名字加上选中的用户的名字
  groupName = ChatUIKit.appUserStore.getSelfUserInfo().name + "、" + groupName;
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
  ChatUIKit.groupStore
    .createGroup({
      data: params
    })
    .then((res) => {
      uni.redirectTo({
        url: `/ChatUIKit/modules/Chat/index?type=groupChat&id=${res.data?.groupid}`
      });
    })
    .finally(() => {
      uni.hideLoading();
    });
};

const onBack = () => {
  uni.switchTab({
    url: "/ChatUIKit/modules/Conversation/index"
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

.nav-bar {
  flex-shrink: 0;
}

.group-create-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contact-indexed-list {
  flex: 1;
  overflow-y: scroll;
}

.empty-wrap {
  flex: 1;
}

.create-btn-wrap {
  flex-shrink: 0;
  display: flex;
  padding: 14px;
  align-items: center;
  border-top: 0.5px solid #e3e6e8;
  background: #f9fafa;
  backdrop-filter: blur(10px);
  margin-bottom: 45px;
}

.search-list-comp {
  height: 100%;
}

.crate-btn {
  width: 100%;
}
</style>
