<template>
  <view :class="['nav-bar-wrap', { 'nav-bar-weixin': isWXProgram }]">
    <view class="left">
      <view
        v-if="props.showBackArrow"
        class="arrow-left"
        @tap="onLeftTap"
      ></view>
      <slot name="left"></slot>
    </view>
    <view class="center">
      <slot name="center"></slot>
    </view>
    <view class="right">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { isWXProgram } from "../../utils/index";
const props = defineProps({
  showBackArrow: {
    type: Boolean,
    required: false,
    default: true
  }
});

const emits = defineEmits(["onLeftTap"]);

const onLeftTap = () => {
  emits("onLeftTap");
};
</script>

<style lang="scss" scoped>
.nav-bar-wrap {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-sizing: border-box;
  margin-top: var(--status-bar-height);
}

.nav-bar-weixin {
  margin-top: calc(var(--status-bar-height) + 22px) !important;
}

.left {
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-left {
  width: 24px;
  height: 24px;
  background: url("../../assets/icon/arrow-left.png") no-repeat;
  background-size: 100% 100%;
}
</style>
