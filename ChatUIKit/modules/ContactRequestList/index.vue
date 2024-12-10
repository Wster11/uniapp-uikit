<template>
  <view class="request-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('contactRequestListTitle')"></view>
      </template>
    </NavBar>
    <view class="list">
      <view v-if="contactApplyRequestList.length">
        <RequestItem
          v-for="request in contactApplyRequestList"
          :key="request.from"
          :user="{ userId: request.from }"
        />
      </view>
      <Empty v-else />
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../components/NavBar/index.vue";
import Empty from "../../components/Empty/index.vue";
import RequestItem from "./components/RequestItem/index.vue";
import { t } from "../../locales/index";
import { ChatUIKit } from "../../index";
import { ContactNotice } from "../../types/index";
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";

const contactApplyRequestList = ref<ContactNotice[]>([]);

const unwatchContactApplyRequestList = autorun(() => {
  contactApplyRequestList.value =
    ChatUIKit.contactStore.contactsNoticeInfo.list.filter((info) => {
      return info.ext === "invited";
    });
});

const onBack = () => {
  uni.navigateBack();
};

onUnmounted(() => {
  unwatchContactApplyRequestList();
});
</script>

<style lang="scss" scoped>
.request-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.list {
  flex: 1;
  overflow-y: scroll;
}
</style>
