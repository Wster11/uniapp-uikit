<template>
  <view class="tool-video-wrap tool-item" @tap="chooseFile">
    <ItemContainer :title="title" :iconUrl="fileButton"> </ItemContainer>
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

const fileButton = ASSETS_URL + "icon/folder.png";

const title = t("file");

const toolbarInject = inject<InputToolbarEvent>("InputToolbarEvent");

const conn = ChatUIKit.getChatConn();

const convStore = ChatUIKit.convStore;

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

  const token = conn.token;
  const requestParams = {
    url: uploadUrl,
    filePath: tempFile.path,
    name: "file",
    header: {
      Authorization: "Bearer " + token
    }
  };

  const fileMsg = chatSDK.message.create({
    type: "file",
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    //@ts-ignore
    body: {
      url: tempFile.path,
      filename: tempFile.name,
      //@ts-ignore
      file_length: tempFile.size
    },
    ext: {
      ease_chat_uikit_user_info: {
        avatarURL: ChatUIKit.appUserStore.getSelfUserInfo().avatar,
        nickname: ChatUIKit.appUserStore.getSelfUserInfo().name
      }
    }
  });
  toolbarInject?.closeToolbar();
  ChatUIKit.messageStore.sendMessage(fileMsg, () => {
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
