<template>
  <view class="me-wrap">
    <view class="me-info-wrap">
      <Avatar
        class="me-avatar"
        :src="userInfo.avatar"
        :size="100"
        :placeholder="USER_AVATAR_URL"
        :withPresence="true"
        :presenceExt="userInfo.presenceExt"
        :isOnline="userInfo.isOnline"
      />
      <view class="name">{{ userInfo.name }}</view>
      <view class="userId"
        >{{ "ID: " + userId }}
        <view class="copy" @tap="copy"></view>
      </view>
    </view>
    <view class="content">
      <view class="menu-group-name">
        {{ t("meSettingGroupName") }}
      </view>
      <view class="menu-wrap">
        <MenuItem
          class="me-menu"
          :title="t('meStatus')"
          @tap="toPresenceSetting"
        >
          <template v-slot:left>
            <view class="icon status"> </view>
          </template>
        </MenuItem>
        <MenuItem class="me-menu" :title="t('meInfo')" @tap="toProfile">
          <template v-slot:left>
            <view class="icon person"> </view>
          </template>
        </MenuItem>
        <MenuItem class="me-menu" :title="t('meAbout')" @tap="toAbout">
          <template v-slot:left>
            <view class="icon about"> </view>
          </template>
        </MenuItem>
      </view>
      <view class="menu-group-name">
        {{ t("meLoginGroupName") }}
      </view>
      <view class="logout" @tap="logout">{{ t("meLogout") }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../ChatUIKit/components/Avatar/index.vue";
import MenuItem from "../../ChatUIKit/components/MenuItem/index.vue";
import { ref, onUnmounted } from "vue";
import { t } from "../../const/locales";
import { ChatUIKit } from "../../ChatUIKit/index";
import { CHAT_STORE } from "@/const/index";
import { USER_AVATAR_URL } from "../../ChatUIKit/const";
import { UserInfoWithPresence } from "../../ChatUIKit/types";
import { autorun } from "mobx";

const userId = ChatUIKit.getChatConn().user;

const userInfo = ref<UserInfoWithPresence>({} as UserInfoWithPresence);

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKit.appUserStore.getSelfUserInfo();
});

const copy = () => {
  uni.setClipboardData({
    data: userId
  });
};

const logout = () => {
  ChatUIKit.chatStore.close();
  uni.removeStorageSync(CHAT_STORE);
  uni.reLaunch({
    url: "/pages/Login/index"
  });
};

const toProfile = () => {
  uni.navigateTo({
    url: "/pages/Profile/index"
  });
};

const toAbout = () => {
  uni.navigateTo({
    url: "/pages/About/index"
  });
};

const toPresenceSetting = () => {
  uni.navigateTo({
    url: "/pages/PresenceSetting/index"
  });
};

onUnmounted(() => {
  unwatchUserInfo();
});
</script>

<style lang="scss" scoped>
.menu-wrap {
  display: flex;
  flex-direction: column;
}

.me-menu {
  padding: 0 16px;
}
</style>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
