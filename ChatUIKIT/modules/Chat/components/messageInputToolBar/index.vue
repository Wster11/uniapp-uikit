<template>
  <view class="message-input-toolbar">
    <swiper class="swiper">
      <swiper-item class="swiper-item">
        <view class="item-wrap">
          <ImageUpload />
          <VideoUpload />
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import ImageUpload from "./imageUpload.vue";
import VideoUpload from "./videoUpload.vue";
const emits = defineEmits(["onMessageSend"]);
</script>
<style lang="scss" scoped>
.message-input-toolbar {
  background: #f9fafa;
}

.swiper {
  min-height: 150px;
  padding: 15px 30px 0 30px;
}

.swiper-item {
  width: 100%;
}

.item-wrap {
  display: flex;
  flex-flow: wrap;
}
</style>
