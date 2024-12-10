<template>
  <view>
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('contactAddTitle')"></view>
      </template>
    </NavBar>
    <view class="content">
      <view class="input-wrap">
        <input
          class="input"
          focus="true"
          v-model="userId"
          :placeholder="t('contactAddInputPlaceholder')"
        />
      </view>
      <view class="btn-wrap">
        <UIKITButton :disabled="!userId.length" @tap="addContact">
          {{ t("contactAddBtn") }}
        </UIKITButton>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../components/NavBar/index.vue";
import UIKITButton from "../../components/Button/index.vue";
import { t } from "../../locales/index";
import { ChatUIKit } from "../../index";
import { ref } from "vue";

const userId = ref("");

const onBack = () => {
  uni.navigateBack();
};

const addContact = async () => {
  if (!userId.value.length) {
    return;
  }
  try {
    ChatUIKit.contactStore.addContact(userId.value);
    uni.showToast({
      title: t("contactAddSuccess"),
      icon: "none"
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.showToast({
      title: t("contactAddFailed"),
      icon: "none"
    });
  }
};
</script>

<style lang="scss" scoped>
.content {
  margin: 30px;
}

.input-wrap {
  display: flex;
  padding: 13px 16px;
  align-items: center;
  border-radius: 4px;
  background: #f1f2f3;
}

.input {
  width: 100%;
}

.btn-wrap {
  margin-top: 24px;
}
</style>
