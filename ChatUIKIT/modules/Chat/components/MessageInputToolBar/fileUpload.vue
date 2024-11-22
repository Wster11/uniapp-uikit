<template>
  <view class="tool-video-wrap tool-item" @tap="chooseFile">
    <ItemContainer :title="title" :iconUrl="fileButton"> </ItemContainer>
  </view>
</template>

<script lang="ts" setup>
import ItemContainer from "./itemContainer.vue";
import fileButton from "../../../../assets/icon/folder.png";
import type { InputToolbarEvent } from "../../../../types/index";
import { inject } from "vue";
import { t } from "../../../../locales/index";
import { ChatUIKIT } from "../../../../index";
import { chatSDK } from "../../../../sdk";
interface Props {
  title?: string;
}
defineProps<Props>();

const title = t("file");

const toolbarInject = inject<InputToolbarEvent>("InputToolbarEvent");

const conn = ChatUIKIT.getChatConn();

const convStore = ChatUIKIT.convStore;

const chooseFile = () => {
  // #ifdef MP-WEIXIN
  wx.chooseMessageFile({
    count: 1,
    type: "all",
    success(res) {
      sendFileMessage({ tempFile: res.tempFiles[0] });
    },
    fail(e) {
      console.error("chooseMessageFile failed", e);
    }
  });
  // #endif

  // h5 选择文件
  // #ifdef WEB
  uni.chooseFile({
    count: 1,
    success(res) {
      sendFileMessage({ tempFile: res.tempFiles[0] });
    }
  });
  // #endif;
};

const sendFileMessage = (res: any) => {
  const tempFile = res?.tempFile;
  const uploadUrl = `${conn.apiUrl}/${conn.orgName}/${conn.appName}/chatfiles`;
  if (!tempFile) {
    return;
  }

  uni.showLoading();
  const token = conn.token;
  const requestParams = {
    url: uploadUrl,
    filePath: tempFile.path,
    fileType: tempFile.type,
    name: "file",
    header: {
      Authorization: "Bearer " + token
    },
    success: async (res: any) => {
      const data = JSON.parse(res.data);
      const videoMsg = chatSDK.message.create({
        type: "file",
        to: convStore.currConversation!.conversationId,
        chatType: convStore.currConversation!.conversationType,
        //@ts-ignore
        body: {
          url: data.uri + "/" + data.entities[0].uuid,
          filename: tempFile.name,
          //@ts-ignore
          file_length: tempFile.size
        },
        ext: {
          ease_chat_uikit_user_info: {
            avatarURL: ChatUIKIT.appUserStore.getSelfUserInfo().avatar,
            nickname: ChatUIKIT.appUserStore.getSelfUserInfo().name
          }
        }
      });
      try {
        await ChatUIKIT.messageStore.sendMessage(videoMsg);
        toolbarInject?.closeToolbar();
      } catch (error: any) {
        uni.showToast({
          title: `send failed: ${error.message}`,
          icon: "none"
        });
      }
      uni.hideLoading();
    },
    fail: (e: any) => {
      uni.hideLoading();
      uni.showToast({ title: t("uploadFailed"), icon: "none" });
    }
  };
  //@ts-ignore
  uni.uploadFile(requestParams);
};
</script>

<style lang="scss" scoped>
.tool-item {
  display: flex;
  justify-content: center;
}
</style>
