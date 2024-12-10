<template>
  <view>
    <NavBar :showBackArrow="false">
      <template v-slot:left>
        <Avatar
          :size="32"
          :src="userInfo.avatar"
          :withPresence="true"
          :placeholder="USER_AVATAR_URL"
          :presenceExt="userInfo.presenceExt"
          :isOnline="userInfo.isOnline"
        />
      </template>
      <template v-slot:center>
        <view class="title"></view>
      </template>
      <template v-slot:right>
        <view class="btn-wrap">
          <!-- #ifndef MP-WEIXIN-->
          <view class="action-btn" @tap="isShowPopMenu = true"></view>
          <!-- #endif -->
        </view>
      </template>
    </NavBar>
    <!-- #ifdef MP-WEIXIN-->
    <view class="wx-btn-wrap">
      <view class="wx-btn" @tap="isShowPopMenu = true"></view>
    </view>
    <!-- #endif -->

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
import Avatar from "../../../../components/Avatar/index.vue";
import NavBar from "../../../../components/NavBar/index.vue";
import PopMenu from "../../../../components/PopMenu/index.vue";
import { ref, onUnmounted } from "vue";
import { ChatUIKit } from "../../../../index";
import { t } from "../../../../locales/index";
import { USER_AVATAR_URL, ASSETS_URL } from "../../../../const/index";
import { isWXProgram } from "../../../../utils/index";
import { UserInfoWithPresence } from "../../../../types/index";
import { autorun } from "mobx";

const ChatMenuIcon = ASSETS_URL + "icon/chat.png";
const AddContactMenuIcon = ASSETS_URL + "icon/addContact.png";
const CreateGroupIcon = ASSETS_URL + "icon/createGroup.png";  

const isShowPopMenu = ref(false);

const PopMenuStyle = isWXProgram
  ? {
      right: "40px",
      bottom: "calc(120px - var(--safe-area-inset-bottom))"
    }
  : {
      right: "25px",
      top: "calc(var(--status-bar-height) + 50px"
    };

const userInfo = ref<UserInfoWithPresence>({} as UserInfoWithPresence);

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
  userInfo.value = ChatUIKit.appUserStore.getSelfUserInfo();
});

const handleMenuTap = (params) => {
  switch (params.type) {
    case "newConversation":
      uni.navigateTo({
        url: "/ChatUIKit/modules/ChatNew/index"
      });
      break;
    case "createGroup":
      uni.navigateTo({
        url: "/ChatUIKit/modules/GroupCreate/index"
      });
      break;
    case "addContact":
      uni.navigateTo({
        url: "/ChatUIKit/modules/ContactAdd/index"
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

.wx-btn-wrap {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 65px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(180deg, #009eff 0%, #334bff 100%);
  box-shadow: 8px 0px 24px 0px rgba(26, 26, 26, 0.1),
    0px 24px 36px 0px rgba(77, 77, 77, 0.15);
}

.wx-btn {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/wx_plus.png") no-repeat;
  background-size: 100% 100%;
}
</style>
