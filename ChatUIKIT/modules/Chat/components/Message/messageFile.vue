<template>
  <view :class="['msg-file', { isSelf: isSelf }]" @tap="previewFile">
    <view class="left"> </view>
    <view class="right">
      <view class="file-name ellipsis">{{ props.msg.filename }}</view>
      <view class="file-size">{{ fileSize }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Chat } from "../../../../types/index";
import { ChatUIKIT } from "../../../../index";
interface Props {
  msg: Chat.FileMsgBody;
}

const props = defineProps<Props>();
const isSelf = ChatUIKIT.messageStore.checkMessageFromIsSelf(props.msg);
const fileSize = (props.msg.file_length / 1024).toFixed(2) + "kb";

const previewFile = () => {
  /*  #ifndef WEB  */
  uni.showLoading({
    title: "loading",
    mask: true
  });
  uni.downloadFile({
    url: props.msg.url,
    success: function (res) {
      let filePath = res.tempFilePath;
      uni.openDocument({
        filePath: filePath,
        showMenu: false,
        success: function (res) {
          console.log("open ducoment success");
        },
        fail: function (err) {
          console.log("open ducoment fail", err);
        }
      });
    },
    fail: (err) => {
      uni.showToast({
        title: "文件下载失败",
        icon: "none"
      });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
  /*  #endif  */
};
</script>

<style lang="scss" scoped>
@import url("../../../../styles/common.scss");

.msg-file {
  display: flex;
  max-width: 220px;
  text-align: left;
  flex-direction: row-reverse;
  align-items: center;
  .left {
    margin-left: 12px;
  }
}

.isSelf {
  flex-direction: row;
  .left {
    margin-left: 0;
    margin-right: 12px;
  }
}

.left {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  background-color: #fff;
  background-image: url("../../../../assets/icon/file.png");
  background-size: 32px 32px;
  background-position: center center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.right {
  flex: 1;
}

.file-name {
  /** color: #f9fafa;*/
  font-size: 14px;
  line-height: 22px;
  max-width: 140px;
}

.file-size {
  font-size: 14px;
  /** color: #f1f2f3; */
  line-height: 18px;
}
</style>
