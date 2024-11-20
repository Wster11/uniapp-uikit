<template>
  <view>
    <Navbar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('contactAddTitle')"></view>
      </template>
    </Navbar>
    <view class="content">
      <view class="input-wrap">
        <input
          class="input"
          focus="true"
          v-model="userId"
          :placeholder="t('contactAddInputPlaceholder')"
        />
      </view>

      <view
        :class="[{ 'btn-disabled': !userId.length }, 'btn']"
        @tap="addContact"
      >
        {{ t("contactAddBtn") }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Navbar from "../common/NavBar/index.vue";
import { t } from "../../locales/index";
import { ChatUIKIT } from "../../index";
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
    ChatUIKIT.contactStore.addContact(userId.value);
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

.btn {
  display: flex;
  padding: 11px 24px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: linear-gradient(180deg, #009eff 0%, #334bff 100%);
  color: #f9fafa;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  margin-top: 24px;
}

.btn-disabled {
  background: #f1f2f3;
  color: #acb4b9;
}
</style>
