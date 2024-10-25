<template>
  <view
    class="swipe-menu-wrap"
    @touchmove="touchMoveHandler"
    @touchstart="touchStartHandler"
    :style="{ transform: `translateX(${props.showMenu ? -272 : 0}px)` }"
  >
    <view
      :class="[
        'conversation-item-wrap',
        { 'pin-conversation-item-wrap': props.conversation.isPinned }
      ]"
      @tap="toChatPage"
    >
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
            <view
              class="last-msg ellipsis"
              v-if="conversation.lastMessage?.type === 'txt'"
            >
              <span
                v-for="(item, idx) in renderTxt(conversation.lastMessage.msg)"
                :key="idx"
              >
                <span v-if="item.type === 'text'"> {{ item.value }}</span>
                <!-- emoji -->
                <!-- <image v-else class="msg-emoji" :src="item.value" /> -->
                <!-- emoji alt -->
                <span v-else> {{ item.alt }}</span>
              </span>
            </view>
            <view v-else class="last-msg ellipsis">
              {{ formatLastMessage(conversation) }}
            </view>
          </view>
        </view>
        <view class="msg-right-wrap">
          <view class="time">{{
            getConversationTime(conversation.lastMessage)
          }}</view>
          <view :class="conversation.unReadCount ? '' : 'hidden'">
            <view v-if="isMute" class="unread-mute"></view>
            <view v-else class="unread-count">
              {{
                conversation.unReadCount > 99 ? "99+" : conversation.unReadCount
              }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="menu-wrap">
      <view
        :class="['menu', menu.class]"
        v-for="menu in menuList"
        :key="menu.action"
        @click="handleMenuClick(menu.action)"
      >
        {{ menu.name }}
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
import { ref, onUnmounted, computed } from "vue";
import { EaseConnKit } from "../../../../index";
import { renderTxt } from "../../../../utils/index";
import { autorun } from "mobx";

interface Props {
  conversation: EasemobChat.ConversationItem;
  showMenu: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits(["mute", "pin", "delete", "leftSwipe"]);

let startX = 0;

const appUserStore = EaseConnKit.appUserStore;

const groupStore = EaseConnKit.groupStore;

const conversationInfo = ref<any>({});

const isMute = ref<Boolean>(false);

const menuList = computed(() => {
  return [
    {
      name: isMute.value ? t("unmute") : t("mute"),
      action: "mute",
      class: "mute"
    },
    {
      name: props.conversation.isPinned ? t("unpin") : t("pin"),
      action: "pin",
      class: "pin"
    },
    {
      name: t("deleteConv"),
      action: "delete",
      class: "delete"
    }
  ];
});

const uninstallIsMuteWatch = autorun(() => {
  isMute.value = EaseConnKit.convStore.getConversationMuteStatus(
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
  emits("leftSwipe", null);
  uni.navigateTo({
    url: `../Chat/index?type=${props.conversation.conversationType}&id=${props.conversation.conversationId}`
  });
};

const formatLastMessage = (conversation: EasemobChat.ConversationItem) => {
  let lastMsg = "";
  switch (conversation.lastMessage?.type) {
    case "txt":
      if (conversation.lastMessage?.msg == "the combine message") {
        lastMsg = `[${t("chatHistory")}]`;
      } else {
        lastMsg = conversation.lastMessage?.msg;
      }
      break;
    case "img":
      lastMsg = `[${t("image")}]`;
      break;
    case "audio":
      lastMsg = `[${t("audio")}]`;
      break;
    case "file":
      lastMsg = `[${t("file")}]`;
      break;
    case "video":
      lastMsg = `[${t("video")}]`;
      break;
    case "custom":
      if (conversation.lastMessage.customEvent == "userCard") {
        lastMsg = `[${t("contact")}]`;
      } else {
        lastMsg = `[${t("custom")}]`;
      }
      break;
    case "combine":
      lastMsg = `[${t("chatHistory")}]`;
      break;
    default:
      console.warn("unexpected message type:", conversation.lastMessage?.type);
      break;
  }
  return lastMsg;
};

const handleMenuClick = (action: string) => {
  if (action === "mute") {
    emits("mute", props.conversation);
  } else if (action === "pin") {
    emits("pin", props.conversation);
  } else if (action === "delete") {
    emits("delete", props.conversation);
  }
  emits("leftSwipe", null);
};

// 滑动开始
const touchStartHandler = (e) => {
  startX = e.touches[0].pageX;
};

// 滑动事件处理
const touchMoveHandler = (e) => {
  const pageX = e.touches[0].pageX;
  const moveX = pageX - startX;

  if (Math.abs(moveX) < 80) return;

  if (moveX > 0) {
    emits("leftSwipe", null);
  } else {
    emits("leftSwipe", props.conversation.conversationId);
  }
};

onUnmounted(() => {
  uninstallConvInfoWatch();
  uninstallIsMuteWatch();
});
</script>

<style lang="scss">
@import url("../../../../styles/common.scss");
@import url("./style.scss");
</style>
