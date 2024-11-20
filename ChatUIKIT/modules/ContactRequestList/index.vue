<template>
  <view>
    <Navbar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('contactRequestListTitle')"></view>
      </template>
    </Navbar>
    <view class="content">
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
import Navbar from "../common/NavBar/index.vue";
import Empty from "../common/Empty/index.vue";
import RequestItem from "./components/RequestItem/index.vue";
import { t } from "../../locales/index";
import { ChatUIKIT } from "../../index";
import { ContactNotice } from "../../types/index";
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";

const contactApplyRequestList = ref<ContactNotice[]>([]);

const unwatchContactApplyRequestList = autorun(() => {
  contactApplyRequestList.value =
    ChatUIKIT.contactStore.contactsNoticeInfo.list.filter((info) => {
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
