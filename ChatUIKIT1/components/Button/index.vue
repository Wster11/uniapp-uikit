<template>
  <view :class="[{ 'btn-disabled': props.disabled }, 'btn']">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean;
}

const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
.btn {
  display: flex;
  padding: 11px 24px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: linear-gradient(180deg, #009eff 0%, #334bff 100%);
  color: #f9fafa;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
}

.btn-disabled {
  background: #f1f2f3;
  color: #acb4b9;
}
</style>
