<template>
  <view class="msg-video">
    <view class="video-poster">
      <image
        @error="onError"
        class="image"
        :src="isError ? VideoNotFound : msg.thumb"
      />
      <view v-if="!isError" @tap="toVideoPreview" class="video-play-btn">
        <image class="video-play-btn-image" :src="VideoPlayBtn" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Chat } from "../../../../types/index";
import { ASSETS_URL } from "../../../../const/index";
import { ref } from "vue";

const VideoNotFound = ASSETS_URL + "video404.png";
const VideoPlayBtn = ASSETS_URL + "videoplay.png";

interface Props {
  msg: Chat.VideoMsgBody;
  disabledPreview?: boolean;
}
const props = defineProps<Props>();

const isError = ref(false);

const onError = () => {
  isError.value = true;
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
  width: 100%;
  height: 100%;
}

.video-poster {
  position: relative;
  width: 120px;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.video-play-btn {
  width: 64px;
  height: 64px;
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
