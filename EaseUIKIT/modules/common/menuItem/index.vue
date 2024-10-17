<template>
  <view @click="onClick" :class="['menu-container', props.className]">
    <view :class="['menu-item', { 'menu-item-divider': !isHideDivider }]">{{
      props.name
    }}</view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  className: string;
  name: string; // 菜单名称
  hideDivider?: boolean; // 是否显示分割线
}

const props = defineProps<Props>();

const isHideDivider = computed(() => {
  return props.hideDivider || false;
});

const emits = defineEmits(["click"]);

const onClick = () => {
  emits("click");
};
</script>

<style lang="scss" scoped>
.menu-container {
  display: flex;
  width: 100%;
  height: 56px;
  color: #009eff;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 56px;
}

.menu-item {
  width: 100%;
  margin: 0 16px;
}

.menu-item-divider {
  border-bottom: 0.5px solid #e3e6e8;
}
</style>
