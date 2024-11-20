<template>
  <view class="profile-wrap">
    <Navbar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('profileTitle')"></view>
      </template>
    </Navbar>
    <view class="menu-wrap">
      <MenuItem
        :className="'profile-menu'"
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
        :className="'profile-menu'"
        :title="t('profileNick')"
        @tap="toProfileSetting"
      >
        <template v-slot:right>
          <view>{{ userInfo.name }}</view>
        </template>
      </MenuItem>
    </view>
  </view>
</template>

<script setup lang="ts">
import Navbar from "../../ChatUIKIT/modules/common/NavBar/index.vue";
import Avatar from "../../ChatUIKIT/modules/common/Avatar/index.vue";
import MenuItem from "../../ChatUIKIT/modules/common/MenuItem/index.vue";
import { ref, onUnmounted } from "vue";
import { ChatUIKIT } from "../../ChatUIKIT/index";
import { getInsideUploadUrl } from "@/const/index";
import { USER_AVATAR_URL } from "../../ChatUIKIT/const";
import { t } from "../../const/locales";
import { autorun } from "mobx";

const userId = ChatUIKIT.getChatConn().user;

const userInfo = ref({});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getSelfUserInfo();
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

onUnmounted(() => {
  unwatchUserInfo();
});
</script>

<style lang="scss">
.profile-menu {
  padding: 0 16px;
}
</style>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
