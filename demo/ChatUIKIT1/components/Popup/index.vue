<template>
  <view :class="['popup-container', { 'popup-container-hide ': !show }]">
    <view
      v-show="show"
      class="mask"
      @click="onMaskClick"
      :animation="maskAnimation"
    ></view>
    <view
      :class="['popup', { 'popup-show': show }]"
      :animation="popupAnimation"
      :style="{
        borderTopLeftRadius: props.borderRadius,
        borderTopRightRadius: props.borderRadius,
        height: `${popupHeight}px`
      }"
    >
      <view class="popup-content">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue";

interface Props {
  height?: number;
  maskClosable?: boolean;
  borderRadius?: string;
}

const props = defineProps<Props>();

const show = ref(false); // 控制弹窗显示
const popupHeight = ref(props.height || 300); // 弹窗的高度
const animation = ref(null); // 动画实例

// 打开弹窗
const openPopup = () => {
  show.value = true;
  animatePopup(true);
};

// 关闭弹窗
const closePopup = () => {
  animatePopup(false, () => {
    show.value = false;
  });
};

const onMaskClick = () => {
  if (props.maskClosable) {
    closePopup();
  }
};

// 弹窗动画
const animatePopup = (showPopup: boolean, callback?: () => void) => {
  const animationInstance = uni.createAnimation({
    duration: 300, // 动画时长
    timingFunction: "ease-in-out"
  });

  if (showPopup) {
    animationInstance.translateY(0).step(); // 弹出动画
  } else {
    animationInstance.translateY(popupHeight.value).step(); // 收回动画
  }

  animation.value = animationInstance.export();
  if (callback) setTimeout(callback, 300); // 动画结束后执行回调
};

// mask 动画

const maskAnimation = (showPopup: boolean, callback?: () => void) => {
  const animationInstance = uni.createAnimation({
    duration: 300, // 动画时长
    timingFunction: "ease"
  });

  if (showPopup) {
    animationInstance.opacity(0).step();
  } else {
    animationInstance.opacity(1).step();
  }

  animation.value = animationInstance.export();
};

const popupAnimation = animation;

defineExpose({
  openPopup,
  closePopup
});
</script>

<style lang="scss" scoped>
.popup-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 1000;
}

.mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
}

.popup {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f9fafa;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.popup-container-hide {
  height: 0;
  overflow: hidden;
}

.popup-show {
  transform: translateY(0);
}

.popup-content {
  text-align: center;
}
</style>
