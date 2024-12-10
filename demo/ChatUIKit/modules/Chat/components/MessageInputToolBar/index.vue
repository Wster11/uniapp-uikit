<template>
  <view class="message-input-toolbar">
    <swiper class="swiper">
      <swiper-item class="swiper-item">
        <view class="item-wrap">
          <view v-if="featureConfig.inputImage" class="item">
            <ImageUpload />
          </view>
          <view v-if="featureConfig.inputVideo" class="item" style="width: 25%">
            <VideoUpload />
          </view>
          <!-- #ifdef H5 || MP-WEIXIN -->
          <view v-if="featureConfig.inputFile" class="item" style="width: 25%">
            <FileUpload />
          </view>
          <!-- #endif -->
          <view v-if="featureConfig.userCard" class="item" style="width: 25%">
            <UserCard @onUserCardButtonTap="selectUserCard" />
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import ImageUpload from "./imageUpload.vue";
import VideoUpload from "./videoUpload.vue";
import FileUpload from "./fileUpload.vue";
import UserCard from "./userCard.vue";
import { ChatUIKit } from "../../../../index";

const featureConfig = ChatUIKit.getFeatureConfig();

const emits = defineEmits(["onUserCardButtonTap"]);

const selectUserCard = () => {
  emits("onUserCardButtonTap");
};
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

.item {
  width: 25%;
}
</style>
