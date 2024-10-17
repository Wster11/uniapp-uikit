<template>
  <view class="conversation-item-wrap" @tap="toChatPage">
    <view class="avatar-wrap">
      <Avatar
        :src="conversationInfo.avatar"
        :placeholder="getAvatarPlaceholder()"
      />
    </view>
    <view class="content-wrap">
      <view class="user-info-wrap">
        <view class="info-wrap">
          <view class="user-nick-name ellipsis"
            >{{ conversationInfo.name }}
          </view>
          <image
            v-if="isMute"
            style="width: 20px; height: 20px"
            src="../../../../assets/icon/mute.png"
          />
        </view>
        <view class="msg-wrap">
          <view class="last-msg ellipsis">{{
            formatLastMessage(conversation)
          }}</view>
        </view>
      </view>
      <view class="msg-right-wrap">
        <view class="time">{{
          getConversationTime(conversation.lastMessage)
        }}</view>
        <view v-if="isMute" class="unread-mute"></view>
        <view v-else class="unread-count">
          {{ conversation.unReadCount > 99 ? "99+" : conversation.unReadCount }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { EasemobChat } from "easemob-websdk/Easemob-chat";
import Avatar from "../../../common/avatar/index.vue";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import defaultGroupAvatar from "../../../../assets/defaultGroupAvatar.png";
import { t } from "../../../../locales/index";
import { ref, onUnmounted } from "vue";
import { EaseConnKit } from "../../../../index";
import { autorun } from "mobx";

interface Props {
  conversation: EasemobChat.ConversationItem;
}
const props = defineProps<Props>();

const appUserStore = EaseConnKit.appUserStore;

const groupStore = EaseConnKit.groupStore;

const conversationInfo = ref<any>({});

const isMute = ref<Boolean>(false);

const uninstallIsMuteWatch = autorun(() => {
  isMute.value = EaseConnKit.convStore.muteConvsMap.get(
    props.conversation.conversationId
  );
});

const uninstallConvInfoWatch = autorun(() => {
  const convId = props.conversation.conversationId;
  if (props.conversation.conversationType === "groupChat") {
    const groupInfo = groupStore.getGroupInfoFromStore(convId);
    conversationInfo.value = {
      name: groupInfo?.groupName,
      avatar: ""
    };
  } else {
    return (conversationInfo.value = appUserStore.getUserInfoFromStore(convId));
  }
});

const { getConversationTime } = EaseConnKit.convStore;

const getAvatarPlaceholder = () => {
  return props.conversation.conversationType === "groupChat"
    ? defaultGroupAvatar
    : defaultAvatar;
};

const toChatPage = () => {
  uni.navigateTo({
    url: `../../pages/Chat/index?type=${props.conversation.conversationType}&id=${props.conversation.conversationId}`
  });
};

const formatLastMessage = (conversation: EasemobChat.ConversationItem) => {
  let lastMsg = "";
  switch (conversation.lastMessage?.type) {
    case "txt":
      if (conversation.lastMessage?.msg == "the combine message") {
        lastMsg = `/${t("chatHistory")}/`;
      } else {
        lastMsg = conversation.lastMessage?.msg;
      }
      break;
    case "img":
      lastMsg = `/${t("image")}/`;
      break;
    case "audio":
      lastMsg = `/${t("audio")}/`;
      break;
    case "file":
      lastMsg = `/${t("file")}/`;
      break;
    case "video":
      lastMsg = `/${t("video")}/`;
      break;
    case "custom":
      if (conversation.lastMessage.customEvent == "userCard") {
        lastMsg = `/${t("contact")}/`;
      } else {
        lastMsg = `/${t("custom")}/`;
      }
      break;
    case "combine":
      lastMsg = `/${t("chatHistory")}/`;
      break;
    default:
      console.warn("unexpected message type:", conversation.lastMessage?.type);
      break;
  }
  return lastMsg;
};

onUnmounted(() => {
  uninstallConvInfoWatch();
  uninstallIsMuteWatch();
});
</script>
<style lang="scss">
@import url("../../../../styles//common.scss");
@import url("./style.scss");
</style>
