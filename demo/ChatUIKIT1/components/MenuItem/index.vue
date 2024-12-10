<template>
  <view class="menu-item" @tap="onTap">
    <view class="left">
      <slot name="left"></slot>
      <view>
        {{ props.title }}
      </view>
    </view>

    <view class="right">
      <slot name="right"></slot>
      <view v-if="props.showArrow" class="arrow"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
const emits = defineEmits(["onMenuClick"]);

const onTap = () => {
  emits("onMenuClick");
};

const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  showArrow: {
    type: Boolean,
    default: true
  }
});
</script>
<style lang="scss" scoped>
.menu-item {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  align-items: center;
  line-height: 22px;
  font-weight: 500;
  color: #171a1c;
  height: 54px;
  background: #f9fafa;
  border-bottom: 0.5px solid #e3e6e8;
  &:active {
    background-color: #f5f5f5;
  }

  .left {
    display: flex;
    align-items: center;
  }

  .right {
    display: flex;
    align-items: center;
  }

  .count {
    color: #75828a;
  }

  .arrow {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/icon/arrow-right.png");
    background-size: 100% 100%;
  }
}
</style>
