<template>
  <view class="profile-setting-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('profileSettingTitle')"></view>
      </template>
      <template v-slot:right>
        <view
          :class="['save', { 'save-disabled': disabled }]"
          @tap="updateNickName"
          >{{ t("profileSettingSave") }}</view
        >
      </template>
    </NavBar>
    <view class="content">
      <textarea
        class="textarea"
        :maxlength="128"
        auto-height="true"
        focus="true"
        :placeholder="t('profileSettingPlaceholder')"
        v-model="inputValue"
      ></textarea>
      <view class="count"> {{ inputValue.length }} / 128 </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../ChatUIKIT/components/NavBar/index.vue";
import { ref, onUnmounted, computed } from "vue";
import { ChatUIKIT } from "../../ChatUIKIT/index";
import { t } from "../../const/locales";
import { autorun } from "mobx";

const inputValue = ref("");

const userInfo = ref({});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getSelfUserInfo();
  inputValue.value = userInfo.value.name;
});

const disabled = computed(() => {
  return inputValue.value === userInfo.value.name;
});

const updateNickName = () => {
  if (disabled.value) {
    return;
  }
  ChatUIKIT.appUserStore.updateUserInfo({
    nickname: inputValue.value
  });

  uni.navigateBack();
};

const onBack = () => {
  uni.navigateBack();
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
