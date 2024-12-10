<template>
  <view class="profile-setting-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('profileSettingTitle')"></view>
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

    <view class="profile-btn-wrap">
      <UIKITButton class="profile-btn" :disabled="disabled" @tap="updateNickName">
        {{ t("presenceConfirm") }}
      </UIKITButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../ChatUIKit/components/NavBar/index.vue";
import UIKITButton from "../../ChatUIKit/components/Button/index.vue";
import { ref, onUnmounted, computed } from "vue";
import { ChatUIKit } from "../../ChatUIKit/index";
import { t } from "../../const/locales";
import { autorun } from "mobx";

const inputValue = ref("");

const userInfo = ref({});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKit.appUserStore.getSelfUserInfo();
  inputValue.value = userInfo.value.name;
});

const disabled = computed(() => {
  return inputValue.value === userInfo.value.name;
});

const updateNickName = () => {
  if (disabled.value) {
    return;
  }
  ChatUIKit.appUserStore
    .updateUserInfo({
      nickname: inputValue.value
    })
    .finally(() => {
      onBack();
    });
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

.profile-btn-wrap {
  position: fixed;
  width: 100%;
  box-sizing: border-box;
  bottom: 45px;
  display: flex;
  padding: 14px;
  align-items: center;
  border-top: 0.5px solid #e3e6e8;
  background: #f9fafa;
  backdrop-filter: blur(10px);
}

.profile-btn {
  width: 100%;
}
</style>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
