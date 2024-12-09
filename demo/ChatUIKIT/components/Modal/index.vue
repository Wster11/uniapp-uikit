<template>
  <view :class="['modal-container', { 'modal-container-hide ': !show }]">
    <!-- 遮罩层 -->
    <view
      v-show="show"
      class="mask"
      @click="onMaskClick"
      :animation="maskAnimation"
    ></view>
    <view :class="['modal']">
      <view class="modal-content" :animation="popupAnimation">
        <view class="title">{{ props.title }}</view>
        <view class="content">
          <slot></slot>
        </view>
        <view class="footer">
          <view class="cancel" @tap="onCancel">{{ t("modalCancel") }}</view>
          <view class="confirm" @tap="onConfirm">{{ t("modalConfirm") }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { t } from "../../locales";

interface Props {
  height?: number;
  maskClosable?: boolean;
  title?: string;
}

const emits = defineEmits(["confirm", "cancel"]);

const props = defineProps<Props>();

const show = ref(false); // 控制弹窗显示
const animation = ref(null); // 动画实例

// 打开弹窗
const openModal = () => {
  show.value = true;
  animatePopup(true);
};

// 关闭弹窗
const closeModal = () => {
  animatePopup(false, () => {
    show.value = false;
  });
};

const onMaskClick = () => {
  if (props.maskClosable) {
    closeModal();
  }
};

const onCancel = () => {
  closeModal();
  emits("cancel");
};

const onConfirm = () => {
  closeModal();
  emits("confirm");
};

// 弹窗动画
const animatePopup = (showPopup: boolean, callback?: () => void) => {
  const animationInstance = uni.createAnimation({
    duration: 300, // 动画时长
    timingFunction: "ease"
  });

  if (showPopup) {
    animationInstance.opacity(1).step(); // 弹出动画
  } else {
    animationInstance.opacity(0).step(); // 收回动画
  }

  animation.value = animationInstance.export();
  if (callback) setTimeout(callback, 300); // 动画结束后执行回调
};

// mask 动画

const maskAnimation = (showModal: boolean, callback?: () => void) => {
  const animationInstance = uni.createAnimation({
    duration: 300, // 动画时长
    timingFunction: "ease"
  });

  if (showModal) {
    animationInstance.opacity(0).step();
  } else {
    animationInstance.opacity(1).step();
  }

  animation.value = animationInstance.export();
};

const popupAnimation = animation;

defineExpose({
  openModal,
  closeModal
});
</script>

<style lang="scss" scoped>
.title {
  color: #000;
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 26px;
}

.modal-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 1000;
}

.mask {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  display: flex;
  flex-direction: column;
  z-index: 3;
  width: 85vw;
  height: 220px;
  max-width: 340px;
  border-radius: 8px;
  box-shadow: 8px 0px 24px 0px rgba(26, 26, 26, 0.1),
    0px 24px 36px 0px rgba(77, 77, 77, 0.15);
  background: #f9fafa;
  padding: 24px 16px;
  opacity: 0;
  margin-top: -50px;
}

.modal-container-hide {
  height: 0;
  overflow: hidden;
}

.content {
  flex: 1;
}

.footer {
  display: flex;
  justify-content: space-between;
}

.cancel {
  display: flex;
  width: 148px;
  height: 50px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #acb4b9;
  color: #464e53;
  text-align: center;
  /* 简体中文/标题/小 */
  font-family: "PingFang SC";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 150% */
}

.confirm {
  display: flex;
  width: 148px;
  height: 50px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: #009dff;
  color: #f9fafa;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 150% */
}
</style>
