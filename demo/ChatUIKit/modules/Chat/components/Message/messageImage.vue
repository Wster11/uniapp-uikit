<template>
  <view class="msg-image">
    <image
      :mode="mode"
      :style="{ width: styles.width, height: styles.height }"
      @error="onError"
      @tap="previewImage"
      @load="onImgLoad"
      class="image"
      :src="isError ? ImageNotFound : msg.thumb || msg.url"
    />
  </view>
</template>

<script lang="ts" setup>
import type { Chat } from "../../../../types/index";
import { ASSETS_URL } from "../../../../const/index";

const ImageNotFound = ASSETS_URL + "img404.png";

import { ref } from "vue";
interface Props {
  msg: Chat.ImgMsgBody;
  mode?: string; // uni image mode
  width?: number;
  height?: number;
  disabledPreview?: boolean; // is use preview
}
const IMAGE_MAX_SIZE = 225;
const props = defineProps<Props>();
const isError = ref(false);
const width = props.width ? `${props.width}px` : "auto";
const height = props.height ? `${props.height}px` : `${IMAGE_MAX_SIZE}px`;
const styles = ref({
  width,
  height
});
const mode = props.mode || "aspectFit";

const onError = () => {
  isError.value = true;
};

const previewImage = () => {
  if (isError.value || props.disabledPreview === true) {
    return;
  }
  uni.previewImage({
    urls: [props.msg.url || ""]
  });
};

const genImageStyles = (value: { width?: any; height?: any }) => {
  const { width, height } = value;
  if (width === 0 || height === 0) {
    return;
  }
  let imageWidth = 0;
  let imageHeight = 0;
  if (width > height) {
    imageWidth = IMAGE_MAX_SIZE;
    imageHeight = (IMAGE_MAX_SIZE * height) / width;
  } else {
    imageWidth = (IMAGE_MAX_SIZE * width) / height;
    imageHeight = IMAGE_MAX_SIZE;
  }
  styles.value.width = imageWidth + "px";
  styles.value.height = imageHeight + "px";
};

const onImgLoad = (e: any) => {
  if (props.width || props.height) {
    return;
  }
  genImageStyles(e.detail);
};
</script>

<style lang="scss" scoped>
.image {
  border-radius: 4px;
}
</style>
