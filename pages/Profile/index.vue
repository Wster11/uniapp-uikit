<template>
  <view class="profile-wrap">
    <view class="profile-info-wrap">
      <Avatar
        class="profile-avatar"
        :src="userInfo.avatar"
        :size="100"
        :placeholder="USER_AVATAR_URL"
      />
      <view class="name">{{ userInfo.name }}</view>
      <view class="userId"
        >{{ "ID: " + userId }}
        <view class="copy" @tap="copy"></view>
      </view>
    </view>
    <view class="content">
      <view class="menu-group-name">
        {{ t("profileSettingGroupName") }}
      </view>
      <view class="menu-wrap">
        <MenuItem :title="t('profileStatus')">
          <template v-slot:left>
            <view class="icon status"> </view>
          </template>
        </MenuItem>
        <MenuItem :title="t('profileInfo')">
          <template v-slot:left>
            <view class="icon person"> </view>
          </template>
        </MenuItem>
        <MenuItem :title="t('profileSetting')">
          <template v-slot:left>
            <view class="icon general"> </view>
          </template>
        </MenuItem>
        <MenuItem :title="t('profileNotice')">
          <template v-slot:left>
            <view class="icon notice"> </view>
          </template>
        </MenuItem>
        <MenuItem :title="t('profilePrivacy')">
          <template v-slot:left>
            <view class="icon privacy"> </view>
          </template>
        </MenuItem>
        <MenuItem :title="t('profileAbout')">
          <template v-slot:left>
            <view class="icon about"> </view>
          </template>
        </MenuItem>
      </view>
      <view class="menu-group-name">
        {{ t("profileLoginGroupName") }}
      </view>
      <view class="logout" @tap="logout">{{ t("profileLogout") }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../ChatUIKIT/modules/common/Avatar/index.vue";
import MenuItem from "../../ChatUIKIT/modules/common/MenuItem/index.vue";
import { ref, onUnmounted } from "vue";
import { t } from "../../const/locales";
import { ChatUIKIT } from "../../ChatUIKIT/index";
import { getInsideUploadUrl } from "@/const/index";
import { CHAT_STORE } from "@/const/index";
import { USER_AVATAR_URL } from "../../ChatUIKIT/const";
import { autorun } from "mobx";

const userId = ChatUIKIT.getChatConn().user;

const userInfo = ref({});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getSelfUserInfo();
});

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const info = ChatUIKIT.appUserStore.appUserInfo.get(userId);
      ChatUIKIT.appUserStore.appUserInfo.set(userId, {
        ...info,
        avatarurl: res.tempFilePaths[0]
      });
      uni.uploadFile({
        url: getInsideUploadUrl(userId),
        filePath: res.tempFilePaths[0],
        fileType: "image",
        name: "file",
        header: {
          Authorization: "Bearer " + ChatUIKIT.getChatConn().token
        },
        success: (res) => {
          const dt = JSON.parse(res.data);
          ChatUIKIT.appUserStore.updateUserInfo({
            //@ts-ignore
            avatarurl: dt.avatarUrl
          });
        }
      });
    }
  });
};

const copy = () => {
  uni.setClipboardData({
    data: userId
  });
};

const logout = () => {
  ChatUIKIT.chatStore.close();
  uni.removeStorageSync(CHAT_STORE);
  uni.reLaunch({
    url: "/pages/Login/index"
  });
};

onUnmounted(() => {
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
