<template>
  <view class="menu-item" @tap="onTap">
    <view>{{ props.title }}</view>
    <view class="right">
      <slot></slot>
      <view class="arrow"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title: string;
}

const emits = defineEmits(["onMenuClick"]);

const onTap = () => {
  emits("onMenuClick");
};

const props = defineProps<Props>();
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
  padding-left: 16px;
  &:active {
    background-color: #f5f5f5;
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
    background-image: url("../../../../assets//icon/arrow-right.png");
    background-size: 100% 100%;
  }
}
</style>
