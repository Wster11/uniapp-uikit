<template>
  <view class="mask" @tap="emits('onMenuClose')">
    <view class="pop show" :style="popStyle">
      <view
        v-for="(item, index) in popButton"
        class="pop-menu-item"
        :key="item.type"
        :title="item.name"
        @tap="handleClick({ type: item.type })"
      >
        <view class="icon">
          <image class="icon-img" :src="item.icon" />
        </view>
        <view>
          {{ item.name }}
        </view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
interface MenuOption {
  name: string;
  type: string;
  icon: string;
}

interface Props {
  popStyle: Record<string, string>;
  options: Array<MenuOption>;
}
const emits = defineEmits(["onMenuTap", "onMenuClose"]);
const props = defineProps<Props>();
const popButton = props.options;

const handleClick = (params) => {
  emits("onMenuTap", params);
  emits("onMenuClose");
};
</script>

<style lang="scss" scoped>
.pop-menu-item {
  display: flex;
  align-items: center;
  color: #171a1c;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  height: 40px;
  padding: 0 12px;
  box-sizing: border-box;
  width: 100%;
  &:active {
    background-color: #f5f5f5;
  }
}

/* 遮罩 */
.mask {
  position: fixed;
  z-index: 999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  .pop {
    position: absolute;
    z-index: 101;
    display: flex;
    padding: 4px 0;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    color: #333;
    /* shadow/onlight/middle */
    box-shadow: 2px 0px 8px 0px rgba(26, 26, 26, 0.1),
      0px 4px 4px 0px rgba(77, 77, 77, 0.15);
    border-radius: 4px;
    background: #f9fafa;
    transition: transform 0.15s ease-in-out 0s;
    user-select: none;
    -webkit-touch-callout: none;
    transform: scale(0, 0);
    color: #171a1c;
    font-size: 16px;
    font-weight: 400;

    &.show {
      transform: scale(1, 1);
    }

    .icon {
      display: flex;
      align-items: center;
    }

    .icon-img {
      width: 22px;
      height: 22px;
      margin-right: 4px;
    }
  }
}
</style>
