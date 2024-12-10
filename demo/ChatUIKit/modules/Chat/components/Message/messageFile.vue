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
import { ChatUIKit } from "../../../../index";
import { logger } from "../../../../log";
import { t } from "../../../../locales";
interface Props {
  msg: Chat.FileMsgBody;
}

const props = defineProps<Props>();
const fileLength = props.msg.file_length || props.msg.body.file_length;
const isSelf = ChatUIKit.messageStore.checkMessageFromIsSelf(props.msg);
const fileSize = (fileLength / 1024).toFixed(2) + "kb";

const previewFile = () => {
  /*  #ifdef WEB  */
  window.open(props.msg.url, "_blank");
  /*  #endif  */

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
        fileType: props.msg.filetype || props.msg.filename.split(".").pop(),
        success: function (res) {
          logger.info("open ducoment success");
        },
        fail: function (err) {
          logger.error("open ducoment fail", err);
          setTimeout(() => {
            uni.showToast({
              title: t("openDocumentFailed"),
              icon: "none"
            });
          });
        }
      });
    },
    fail: (err) => {
      setTimeout(() => {
        uni.showToast({
          title: t("openDocumentFailed"),
          icon: "none"
        });
      }, 200);
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
