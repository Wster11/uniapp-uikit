<template>
  <view class="msg-video">
    <view class="video-poster" :style="posterStyles">
      <image
        :mode="mode"
        @error="onError"
        :style="posterStyles"
        class="image"
        :src="isError ? VideoNotFound : msg.thumb"
      />
      <view
        v-if="!isError"
        @tap="toVideoPreview"
        :style="{ width: btnStyles.width, height: btnStyles.height }"
        class="video-play-btn"
      >
        <image class="video-play-btn-image" :src="VideoPlayBtn" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ASSETS_URL } from "../../../../const/index";
import { ref } from "vue";

const VideoNotFound = ASSETS_URL + "video404.png";
const VideoPlayBtn = ASSETS_URL + "videoplay.png";

const props = defineProps({
  msg: {
    type: Object,
    required: true
  },
  mode: {
    type: String,
    default: "aspectFill"
  },
  width: {
    type: Number,
    default: 120
  },
  height: {
    type: Number,
    default: 200
  },
  disabledPreview: {
    type: Boolean,
    default: false
  }
});

const posterStyles = {
  width: props.width + "px",
  height: props.height + "px"
};

const btnStyles = {
  width: props.width / 2 + "px",
  height: props.width / 2 + "px"
};

const isError = ref(false);

const onError = () => {
  isError.value = true;
};

const toVideoPreview = () => {
  if (props.disabledPreview === true) {
    return;
  }
  uni.navigateTo({
    url: `/ChatUIKit/modules/VideoPreview/index?url=${props.msg.url}`
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
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
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
