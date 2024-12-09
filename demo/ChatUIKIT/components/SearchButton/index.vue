<template>
  <view class="search-btn">
    <view class="search-icon"></view>
    <view>{{ placeholder }}</view>
  </view>
</template>

<script setup lang="ts">
import { t } from "../../locales";
interface Props {
  placeholder?: string;
}

const props = defineProps<Props>();

const placeholder = props.placeholder || t("searchPlaceholder");
</script>

<style lang="scss" scoped>
.search-icon {
  width: 22px;
  height: 22px;
  background: url("../../assets/icon/search.png");
  background-size: 100% 100%;
  margin-right: 5px;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  background: #f1f2f3;
  text-align: center;
  font-size: 16px;
  line-height: 22px;
  color: #919ba1;
  border-radius: 4px;
}
</style>
