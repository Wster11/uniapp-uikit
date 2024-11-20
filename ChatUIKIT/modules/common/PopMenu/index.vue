<template>
  <view class="mask" @tap="emits('onMenuClose')">
    <view class="pop show" :style="popStyle">
      <MenuItem
        v-for="(item, index) in popButton"
        :key="item.type"
        :title="item.name"
        :className="'pop-menu-item'"
        :showArrow="false"
        @tap="handleClick({ type: item.type })"
      >
        <template v-slot:left>
          <view class="icon">
            <image class="icon-img" :src="item.icon" />
          </view>
        </template>
      </MenuItem>
    </view>
  </view>
</template>
<script setup lang="ts">
import MenuItem from "../MenuItem/index.vue";
interface MenuItem {
  name: string;
  type: string;
  icon: string;
}

interface Props {
  popStyle: string;
  options: Array<MenuItem>;
}
const emits = defineEmits(["onMenuTap", "onMenuClose"]);
const props = defineProps<Props>();
const popButton = props.options;

const handleClick = (params) => {
  emits("onMenuTap", params);
  emits("onMenuClose");
};
</script>

<style lang="scss">
.pop-menu-item {
  color: #171a1c;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  height: 40px;
  padding: 0 12px;
}
</style>

<style lang="scss" scoped>
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
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
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
