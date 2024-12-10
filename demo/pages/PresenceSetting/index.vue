<template>
  <view class="presence-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('presenceTitle')"></view>
      </template>
    </NavBar>
    <view class="menu-wrap">
      <radio-group class="radio-group" @change="onChange">
        <label v-for="item in presenceMenus" :key="item.value" class="label">
          <radio
            class="presence-radio"
            :value="item.value"
            :checked="checkedStatus === item.value"
            backgroundColor="#f9fafa"
            borderColor="#ACB4B9"
            activeBackgroundColor="#009DFF"
            activeBorderColor="#009DFF"
            iconColor="#fff"
          />
          <MenuItem
            class="presence-menu"
            :title="item.value !== 'Custom' ? item.title : customPresence"
            :showArrow="false"
          >
            <template v-if="item.value === 'Custom'" v-slot:right>
              <view class="edit-btn" @tap="editStatus"></view>
            </template>
          </MenuItem>
        </label>
      </radio-group>
    </view>

    <Modal
      ref="modalRef"
      :title="t('presenceCustom')"
      @confirm="onCustomStatusConfirm"
      @cancel="closeModal"
    >
      <view class="content">
        <view class="custom-wrap">
          <input
            class="input"
            :placeholder="t('presencePlaceholder')"
            :focus="isFocus"
            :maxlength="20"
            v-model="inputValue"
          />
          <view class="count">{{ inputValue.length }} / 20</view>
        </view>
      </view>
    </Modal>

    <view class="presence-btn-wrap">
      <UIKITButton class="presence-btn" @tap="publishPresence">
        {{ t("presenceConfirm") }}
      </UIKITButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from "../../ChatUIKit/components/NavBar/index.vue";
import MenuItem from "../../ChatUIKit/components/MenuItem/index.vue";
import UIKITButton from "../../ChatUIKit/components/Button/index.vue";
import { ChatUIKit } from "../../ChatUIKit/index";
import { PRESENCE_STATUS_LIST } from "../../ChatUIKit/const";
import { t } from "../../const/locales";
import { autorun } from "mobx";
import Modal from "../../ChatUIKit/components/Modal/index.vue";
import { ref, computed, onUnmounted } from "vue";

const presenceExt = ref("");
const customPresence = ref(t("presenceCustom"));
const isFocus = ref(false);
const modalRef = ref(null);
const inputValue = ref("");

// 状态与国际化键的映射关系
const STATUS_TITLE_MAP: Record<string, string> = {
  Online: "presenceOnline",
  Offline: "presenceOffline",
  Away: "presenceAway",
  Busy: "presenceBusy",
  "Do Not Disturb": "presenceNoDisturb",
  Custom: "presenceCustom"
};

const presenceMenus = PRESENCE_STATUS_LIST.map((status) => ({
  title: t(STATUS_TITLE_MAP[status] || "presenceOffline"),
  value: status
}));

const unwatchUserInfo = autorun(() => {
  presenceExt.value = ChatUIKit.appUserStore.getSelfUserInfo().presenceExt;
});

const checkedStatus = computed(() => {
  if (PRESENCE_STATUS_LIST.includes(presenceExt.value)) {
    return presenceExt.value;
  } else {
    inputValue.value = customPresence.value =
      ChatUIKit.appUserStore.getSelfUserInfo().presenceExt || "";

    return "Custom";
  }
});

const onBack = () => {
  uni.navigateBack();
};

const onChange = (e) => {
  presenceExt.value = e.detail.value;
};

const editStatus = () => {
  modalRef.value.openModal();
  isFocus.value = true;
};

const onCustomStatusConfirm = () => {
  customPresence.value = inputValue.value;
  isFocus.value = false;
};

const closeModal = () => {
  isFocus.value = false;
};

const publishPresence = () => {
  ChatUIKit.appUserStore
    .publishPresence({
      presenceExt:
        checkedStatus.value === "Custom"
          ? customPresence.value
          : checkedStatus.value
    })
    .finally(() => {
      onBack();
    });
};

onUnmounted(() => {
  unwatchUserInfo();
});
</script>

<style lang="scss" scoped>

.presence-menu {
  width: 100%;
  padding: 0 16px;
}

.radio-group {
  display: flex;
  flex-direction: column;
}

.wrap {
  display: flex;
  flex-direction: column;
}

.presence-btn-wrap {
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

.presence-btn {
  width: 100%;
}

.custom-wrap {
  display: flex;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: #f1f2f3;
  box-sizing: border-box;
}

.input {
  flex: 1;
}

.content {
  display: flex;
  align-items: center;
  height: 100%;
}

.count {
  color: #acb4b9;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin-left: 15px;
}

.edit-btn {
  width: 24px;
  height: 24px;
  background-image: url("../../static/icon/edit.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
</style>

<style lang="scss" scoped>
@import url("./style.scss");
</style>
