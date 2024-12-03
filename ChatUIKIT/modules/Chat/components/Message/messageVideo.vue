<template>
  <view class="msg-video">
    <view class="video-poster">
      <image
        :mode="mode"
        :style="{ width: styles.width, height: styles.height }"
        @error="onError"
        @load="onImgLoad"
        class="image"
        :src="isError ? VideoNotFound : msg.thumb"
      />
      <view
        v-if="!isError && isLoaded"
        :style="{ width: btnStyles.width, height: btnStyles.height }"
        @tap="toVideoPreview"
        class="video-play-btn"
      >
        <image class="video-play-btn-image" :src="VideoPlayBtn"></image>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Chat } from "../../../../types/index";
import VideoNotFound from "../../../../assets/video404.png";
import VideoPlayBtn from "../../../../assets/videoplay.png";
import { ref } from "vue";

interface Props {
  msg: Chat.VideoMsgBody;
  mode?: string; // uni image mode
  width?: number;
  height?: number;
  disabledPreview?: boolean; // is use preview
}
const props = defineProps<Props>();

const IMAGE_MAX_SIZE = 225;

const width = props.width ? `${props.width}px` : "auto";
const height = props.height ? `${props.height}px` : `${IMAGE_MAX_SIZE}px`;
const btnStyles = ref({
  width: props.width ? `${props.width / 2}px` : "64px",
  height: props.height ? `${props.height / 2}px` : "64px"
});
const styles = ref({
  width,
  height
});
const mode = props.mode || "widthFix";

const isError = ref(false);

const isLoaded = ref(false);

const onError = () => {
  isError.value = true;
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
  isLoaded.value = true;
  if (props.width && props.height) {
    return;
  }
  genImageStyles(e.detail);
};

const toVideoPreview = () => {
  if (props.disabledPreview === true) {
    return;
  }
  uni.navigateTo({
    url: `/ChatUIKIT/modules/VideoPreview/index?url=${props.msg.url}`
  });
};
</script>

<style lang="scss" scoped>
.msg-video {
  position: relative;
}
.image {
  border-radius: 4px;
}

.video-poster {
  position: relative;
}

.video-play-btn {
  display: inline-block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  border-radius: 50%;
}

.video-play-btn-image {
  width: 100%;
  height: 100%;
}
</style>
