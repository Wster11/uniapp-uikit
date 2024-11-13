<template>
  <view class="tool-item" @tap="selectUserCard">
    <ItemContainer :title="t('userCard')" :iconUrl="UserCard"> </ItemContainer>
  </view>
</template>

<script lang="ts" setup>
import type { InputToolbarEvent } from "../../../../types/index";
import { inject } from "vue";
import ItemContainer from "./itemContainer.vue";
import UserCard from "../../../../assets/icon/usercard.png";
import { t } from "../../../../locales";

const toolbarInject = inject<InputToolbarEvent>("InputToolbarEvent");

const emits = defineEmits(["onUserCardButtonTap"]);

const selectUserCard = () => {
  toolbarInject?.closeToolbar();
  emits("onUserCardButtonTap");
};
</script>

<style lang="scss" scoped>
.tool-item {
  display: flex;
  justify-content: center;
}
</style>
