<template>
  <view class="tool-item-wrap">
    <view class="icon-wrap">
      <image class="icon" :src="iconUrl"></image>
    </view>
    <view>{{ title }}</view>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  title: string;
  iconUrl: string;
}
const props = defineProps<Props>();

const { title, iconUrl } = props;
</script>

<style lang="scss" scoped>
.tool-item-wrap {
  width: 64px;
  font-size: 12px;
  color: #464e53;
  text-align: center;
  line-height: 16px;
  margin-bottom: 12px;
}

.icon-wrap {
  width: 64px;
  height: 64px;
  background: #f1f2f3;
  border-radius: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 32px;
  height: 32px;
}
</style>
