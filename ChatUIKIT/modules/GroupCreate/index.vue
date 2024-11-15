<template>
  <view class="group-create-wrap">
    <NavBar @onBack="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('createGroup')"></view>
      </template>
      <template v-slot:right>
        <view
          :class="[
            'create-btn',
            { 'create-btn-disabled': !selectedUserIds.length }
          ]"
          @tap="createGroup"
          >{{ t("createGroupBtn") + "(" + selectedUserIds.length + ")" }}</view
        >
      </template>
    </NavBar>
    <view class="search-wrap">
      <SearchButton :placeholder="t('searchContact')" />
    </view>
    <IndexedList
      v-if="contactList.length"
      class="contact-indexed-list"
      :options="contactList"
      :withCheckbox="true"
      @checkboxChange="onCheckboxChange"
    >
      <template v-slot:indexedItem="slotProps">
        <UserItem class="contact-item" :user="slotProps.item" />
      </template>
    </IndexedList>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import SearchButton from "../common/SearchButton/index.vue";
import NavBar from "../common/NavBar/index.vue";
import UserItem from "../ContactList/components/UserItem/index.vue";
import Empty from "../common/Empty/index.vue";
import IndexedList from "../common/IndexedList/index.vue";
import { ChatUIKIT } from "../../index";
import { t } from "../../locales";
import { Chat } from "../../sdk";
import { autorun } from "mobx";
import { ref, onUnmounted } from "vue";

const contactList = ref<Chat.ContactItem[]>([]);

const selectedUserIds = ref([]);

const unwatchContactList = autorun(() => {
  contactList.value = ChatUIKIT.contactStore.contacts.map((contact) => ({
    ...contact,
    ...ChatUIKIT.appUserStore.getUserInfoFromStore(contact.userId),
    id: contact.userId
  }));
});

const onCheckboxChange = (values) => {
  console.log(values, "values");
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

.create-btn {
  color: #009dff;
  text-align: right;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
}

.create-btn-disabled {
  color: #acb4b9;
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
  height: calc(100vh - 100px);
}
</style>
