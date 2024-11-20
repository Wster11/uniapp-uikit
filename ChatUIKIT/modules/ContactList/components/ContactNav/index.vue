<template>
  <view>
    <NavBar :showBackArrow="false">
      <template v-slot:left>
        <Avatar
          :size="32"
          :src="userInfo.avatar"
          :placeholder="USER_AVATAR_URL"
        />
      </template>
      <template v-slot:center>
        <view class="title"></view>
      </template>
      <template v-slot:right>
        <view class="btn-wrap" @tap="toAddContact">
          <view class="action-btn"></view>
        </view>
      </template>
    </NavBar>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../common/Avatar/index.vue";
import NavBar from "../../../common/NavBar/index.vue";
import { ref, onUnmounted } from "vue";
import { ChatUIKIT } from "../../../../index";
import { USER_AVATAR_URL } from "../../../../const";
import { autorun } from "mobx";

const userInfo = ref({});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getSelfUserInfo();
});

const toAddContact = () => {};

onUnmounted(() => {
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
.title {
  width: 98px;
  height: 16px;
  background: url("../../../../assets/contact.png") no-repeat;
  background-size: 100% 100%;
}

.btn-wrap {
  display: flex;
  width: 32px;
  justify-content: flex-end;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/person_add.png") no-repeat;
  background-size: 100% 100%;
}
</style>
