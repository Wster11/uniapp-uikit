<template>
  <view
    :class="['avatar', shape]"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <image class="image" :src="imageSrc" :alt="alt" @error="onError"> </image>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { EaseConnKit } from "../../../index";
interface Props {
  src: string;
  alt?: string;
  size?: number;
  shape?: "circle" | "square";
  placeholder?: string;
}

const props = defineProps<Props>();
const isError = ref(false);

const imageSrc = computed(() => {
  if (isError.value) {
    return props.placeholder;
  }
  return props.src || props.placeholder;
});
const size = props.size || 50; // 默认大小为50px
const shape =
  props.shape || EaseConnKit.configStore.config.theme?.avatarShape || "square"; // 默认形状为圆形

const onError = () => {
  isError.value = true;
};
</script>

<style lang="scss" scoped>
.avatar {
  overflow: hidden;
  display: inline-block;
}

.avatar .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image cover-view {
  width: 100%;
  text-align: center;
  color: #fff;
  background-color: rgba(107, 96, 99, 0.4);
  position: absolute;
  left: 50%;
  top: 66%;
  transform: translate(-50%, 0);
}

.avatar.circle {
  border-radius: 50%;
}

.avatar.square {
  border-radius: 4px;
}
</style>
