<template>
  <view class="about-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('aboutTitle')"></view>
      </template>
    </NavBar>
    <view class="about-info-wrap">
      <Avatar
        class="about-avatar"
        src="https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/app.png"
        :size="72"
      />
      <view class="name">{{ t("chatIM") }}</view>
      <view class="version">Version 4.11.0 </view>
      <view class="version">UIKIT Version 1.0.0 </view>
    </view>
    <view class="content">
      <view class="menu-wrap">
        <MenuItem
          class="about-menu"
          v-for="item in menus"
          :key="item.title"
          @tap="onMenuTap(item)"
        >
          <template v-slot:left>
            <view class="left-content">
              <view class="title">{{ item.title }}</view>
              <view class="link">{{ item.link }}</view>
            </view>
          </template>
        </MenuItem>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../ChatUIKit/components/NavBar/index.vue";
import Avatar from "../../ChatUIKit/components/Avatar/index.vue";
import MenuItem from "../../ChatUIKit/components/MenuItem/index.vue";
import { t } from "../../const/locales";

const onBack = () => {
  uni.navigateBack();
};

const menus = [
  {
    title: t("aboutOfficialWebsite"),
    link: "www.easemob.com"
  },
  {
    title: t("aboutHotline"),
    link: "400-622-1776"
  },
  {
    title: t("aboutBusiness"),
    link: "bd@easemob.com"
  },
  {
    title: t("aboutQudao"),
    link: "qudao@easemob.com"
  },
  {
    title: t("aboutIssue"),
    link: "issue@easemob.com"
  }
];

const onMenuTap = (menu) => {
  if (menu.title === t("aboutOfficialWebsite")) {
    const url = "https://www.easemob.com/terms";
    // #ifdef APP-PLUS
    plus.runtime.openURL(url);
    // #endif
    // #ifdef WEB
    window.open(url);
    // #endif
  } else {
    uni.setClipboardData({
      data: menu.link
    });
  }
};
</script>

<style lang="scss" scoped>
.menu-wrap {
  display: flex;
  flex-direction: column;
}

.about-menu {
  padding: 0 16px;
}
</style>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
