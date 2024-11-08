<template>
  <view class="tool-video-wrap tool-item" @tap="chooseVideo">
    <ItemContainer :title="title" :iconUrl="ImageIcon"> </ItemContainer>
  </view>
</template>

<script lang="ts" setup>
import ItemContainer from "./itemContainer.vue";
import ImageIcon from "../../../../assets/icon/imgButton.png";
import { API_URL } from "@/const/index";
import type { InputToolbarEvent } from "@/types/index";
import { inject } from "vue";
import { t } from "../../../../locales/index";
import { ChatUIKIT } from "../../../../index";
import { chatSDK } from "../../../../sdk";
interface Props {
  title?: string;
}
defineProps<Props>();

const title = t("videoUpload");

const toolbarInject = inject<InputToolbarEvent>("InputToolbarEvent");

const conn = ChatUIKIT.connStore.getChatConn();

const convStore = ChatUIKIT.convStore;

const chooseVideo = () => {
  uni.chooseVideo({
    sourceType: ["camera", "album"],
    success: function (res) {
      sendVideoMessage(res);
    }
  });
};

const sendVideoMessage = (res: any) => {
  const tempFilePath = res?.tempFilePath;
  const uploadUrl = `${API_URL}/${conn.orgName}/${conn.appName}/chatfiles`;

  if (!tempFilePath) {
    return;
  }
  uni.showLoading();
  const token = conn.token;
  console.log(token, "  token");
  const requestParams = {
    url: uploadUrl,
    filePath: tempFilePath,
    fileType: "video",
    name: "file",
    header: {
      Authorization: "Bearer " + token
    },
    success: async (res: any) => {
      const data = JSON.parse(res.data);
      const videoMsg = chatSDK.message.create({
        type: "video",
        to: convStore.currConversation!.conversationId,
        chatType: convStore.currConversation!.conversationType,
        file_length: res.duration,
        //@ts-ignore
        body: {
          url: data.uri + "/" + data.entities[0].uuid
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
