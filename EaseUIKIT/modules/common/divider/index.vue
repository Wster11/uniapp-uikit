<template>
  <view :class="['divider']" :style="{ height: `${props.height}px` }"> </view>
</template>

<script lang="ts" setup>
interface Props {
  height: string;
}

const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
.divider {
  width: 100%;
  background: #f1f2f3;
}
</style>
