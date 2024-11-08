<template>
  <view class="tool-image-wrap tool-item" @tap="chooseImage">
    <ItemContainer :title="title" :iconUrl="ImageIcon"> </ItemContainer>
  </view>
</template>

<script lang="ts" setup>
import ItemContainer from "./itemContainer.vue";
import ImageIcon from "../../../../assets/icon/imgButton.png";
import type { InputToolbarEvent } from "../../../../types/index";
import { inject } from "vue";
import { t } from "../../../../locales/index";
import { ChatUIKIT } from "../../../../index";
import { chatSDK } from "../../../../sdk";
interface Props {
  title?: string;
}
defineProps<Props>();

const title = t("imageUpload");

const toolbarInject = inject<InputToolbarEvent>("InputToolbarEvent");

const convStore = ChatUIKIT.convStore;

const conn = ChatUIKIT.connStore.getChatConn();

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ["album"], // 从相册选择
    success: function (res) {
      sendImageMessage(res);
    }
  });
};

const sendImageMessage = (res: any) => {
  const tempFilePath =
    res?.tempFilePaths?.[0] || res?.tempFiles?.[0].tempFilePath;
  const uploadUrl = `${conn.apiUrl}/${conn.orgName}/${conn.appName}/chatfiles`;

  if (!tempFilePath) {
    return;
  }
  uni.showLoading();
  const token = conn.token;
  const requestParams = {
    url: uploadUrl,
    filePath: tempFilePath,
    fileType: "image",
    name: "file",
    header: {
      Authorization: "Bearer " + token
    },
    success: async (res: any) => {
      console.log("图片上传成功", res);
      const data = JSON.parse(res.data);
      const imgMsg = chatSDK.message.create({
        type: "img",
        to: convStore.currConversation!.conversationId,
        chatType: convStore.currConversation!.conversationType,
        url: data.uri + "/" + data.entities[0].uuid,
        ext: {
          ease_chat_uikit_user_info: {
            avatarURL: ChatUIKIT.appUserStore.getSelfUserInfo().avatar,
            nickname: ChatUIKIT.appUserStore.getSelfUserInfo().name
          }
        }
      });
      try {
        await ChatUIKIT.messageStore.sendMessage(imgMsg);
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
