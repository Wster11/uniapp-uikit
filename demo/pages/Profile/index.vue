<template>
  <view class="profile-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('profileTitle')"></view>
      </template>
    </NavBar>
    <view class="menu-wrap">
      <MenuItem
        class="profile-menu"
        :title="t('profileAvatar')"
        @tap="changeAvatar"
      >
        <template v-slot:right>
          <Avatar
            class="profile-avatar"
            :src="userInfo.avatar"
            :size="40"
            :placeholder="USER_AVATAR_URL"
          />
        </template>
      </MenuItem>
      <MenuItem
        class="profile-menu"
        :title="t('profileNick')"
        @tap="toProfileSetting"
      >
        <template v-slot:right>
          <view class="profile-name ellipsis">{{ userInfo.name }}</view>
        </template>
      </MenuItem>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../ChatUIKit/components/NavBar/index.vue";
import Avatar from "../../ChatUIKit/components/Avatar/index.vue";
import MenuItem from "../../ChatUIKit/components/MenuItem/index.vue";
import { ref, onUnmounted } from "vue";
import { ChatUIKit } from "../../ChatUIKit/index";
import { getInsideUploadUrl } from "@/const/index";
import { USER_AVATAR_URL } from "../../ChatUIKit/const";
import { t } from "../../const/locales";
import { autorun } from "mobx";

const userId = ChatUIKit.getChatConn().user;

const userInfo = ref({});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKit.appUserStore.getSelfUserInfo();
});

const onBack = () => {
  uni.navigateBack();
};

const toProfileSetting = () => {
  uni.navigateTo({
    url: "/pages/ProfileSetting/index"
  });
};

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      uni.uploadFile({
        url: getInsideUploadUrl(userId),
        filePath: res.tempFilePaths[0],
        fileType: "image",
        name: "file",
        header: {
          Authorization: "Bearer " + ChatUIKit.getChatConn().token
        },
        success: (res) => {
          const dt = JSON.parse(res.data);
          ChatUIKit.appUserStore.updateUserInfo({
            //@ts-ignore
            avatarurl: dt.avatarUrl
          });
        }
      });
    }
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

.profile-menu {
  padding: 0 16px;
}

.profile-name {
  width: calc(100vw - 200px);
  text-align: right;
}
</style>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
