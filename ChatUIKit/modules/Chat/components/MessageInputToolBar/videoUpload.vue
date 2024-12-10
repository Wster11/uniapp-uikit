<template>
  <view class="tool-video-wrap tool-item" @tap="chooseVideo">
    <ItemContainer :title="title" :iconUrl="videoButton"> </ItemContainer>
  </view>
</template>

<script lang="ts" setup>
import ItemContainer from "./itemContainer.vue";
import { ASSETS_URL } from "../../../../const/index";
import type { InputToolbarEvent } from "../../../../types/index";
import { inject } from "vue";
import { t } from "../../../../locales/index";
import { ChatUIKit } from "../../../../index";
import { chatSDK } from "../../../../sdk";

const videoButton = ASSETS_URL + "icon/videoButton.png";

const title = t("videoUpload");

const toolbarInject = inject<InputToolbarEvent>("InputToolbarEvent");

const conn = ChatUIKit.getChatConn();

const convStore = ChatUIKit.convStore;

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
  const uploadUrl = `${conn.apiUrl}/${conn.orgName}/${conn.appName}/chatfiles`;
  if (!tempFilePath) {
    return;
  }
  const token = conn.token;
  const requestParams = {
    url: uploadUrl,
    filePath: tempFilePath,
    fileType: "video",
    name: "file",
    header: {
      Authorization: "Bearer " + token
    }
  };

  const videoMsg = chatSDK.message.create({
    type: "video",
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    //@ts-ignore
    body: {
      url: tempFilePath
    },
    ext: {
      ease_chat_uikit_user_info: {
        avatarURL: ChatUIKit.appUserStore.getSelfUserInfo().avatar,
        nickname: ChatUIKit.appUserStore.getSelfUserInfo().name
      }
    }
  });
  toolbarInject?.closeToolbar();
  ChatUIKit.messageStore.sendMessage(videoMsg, () => {
    return uni.uploadFile(requestParams);
  });
};
</script>

<style lang="scss" scoped>
.tool-item {
  display: flex;
  justify-content: center;
}
</style>
