<template>
  <view>
    <NavBar :showBackArrow="false">
      <template v-slot:left>
        <Avatar
          :size="32"
          :src="userInfo.avatar"
          :placeholder="USER_AVATAR_URL"
        />
      </template>
      <template v-slot:center>
        <view class="title"></view>
      </template>
      <template v-slot:right>
        <view class="btn-wrap" @tap="isShowPopMenu = true">
          <view class="action-btn"></view>
        </view>
      </template>
    </NavBar>
    <PopMenu
      v-if="isShowPopMenu"
      :options="options"
      :popStyle="PopMenuStyle"
      @onMenuTap="handleMenuTap"
      @onMenuClose="isShowPopMenu = false"
    />
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../common/Avatar/index.vue";
import NavBar from "../../../common/NavBar/index.vue";
import PopMenu from "../../../common/PopMenu/index.vue";
import ChatMenuIcon from "../../../../assets/icon/chat.png";
import AddContactMenuIcon from "../../../../assets/icon/addContact.png";
import CreateGroupIcon from "../../../../assets/icon/createGroup.png";
import { ref, onUnmounted } from "vue";
import { ChatUIKIT } from "../../../../index";
import { t } from "../../../../locales/index";
import { USER_AVATAR_URL } from "../../../../const";
import { autorun } from "mobx";

const isShowPopMenu = ref(false);

const PopMenuStyle = {
  right: "25px",
  top: "calc(var(--status-bar-height) + 50px"
};

const userInfo = ref({});

const options = [
  {
    name: t("newChatButton"),
    type: "newConversation",
    icon: ChatMenuIcon
  },
  {
    name: t("addContact"),
    type: "addContact",
    icon: AddContactMenuIcon
  },
  {
    name: t("createGroup"),
    type: "createGroup",
    icon: CreateGroupIcon
  }
];

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getSelfUserInfo();
});

const handleMenuTap = (params) => {
  switch (params.type) {
    case "newConversation":
      uni.navigateTo({
        url: "/ChatUIKIT/modules/ChatNew/index"
      });
      break;
    case "createGroup":
      uni.navigateTo({
        url: "/ChatUIKIT/modules/GroupCreate/index"
      });
      break;
    case "addContact":
      uni.navigateTo({
        url: "/ChatUIKIT/modules/ContactAdd/index"
      });
      break;
    default:
      break;
  }
};

onUnmounted(() => {
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
.title {
  width: 50px;
  height: 22px;
  background: url("../../../../assets/chat.png") no-repeat;
  background-size: 100% 100%;
}

.btn-wrap {
  display: flex;
  width: 32px;
  justify-content: flex-end;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/plus.png") no-repeat;
  background-size: 100% 100%;
}
</style>
