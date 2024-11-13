<template>
  <view class="search-input-warp">
    <view class="content">
      <view class="icon"></view>
      <input
        @input="handleInput"
        type="text"
        :focus="props.focus"
        placeholder="搜索"
      />
    </view>
    <view @tap="handleCancel" class="cancel">取消</view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  focus?: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits(["input", "cancel"]);

const handleInput = (e) => {
  emits("input", e.detail.value);
};

const handleCancel = () => {
  emits("cancel");
};
</script>

<style lang="scss" scoped>
.search-input-warp {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .content {
    display: flex;
    width: 100%;
    height: 36px;
    background: #f1f2f3;
    border-radius: 4px;
    align-items: center;
    color: var(--Neutral-1, #171a1c);
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
  }
}

.icon {
  width: 22px;
  height: 22px;
  background-image: url("../../assets/icon/search.png");
  background-size: 100% 100%;
  margin-right: 5px;
}

.cancel {
  flex-shrink: 0;
  color: #009dff;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  margin: 0 0 0 20px;
}
</style>
