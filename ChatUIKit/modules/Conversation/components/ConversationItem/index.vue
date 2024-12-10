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
              v-if="conversation.atType && conversation.atType !== 'NONE'"
              class="mention-tag"
            >
              {{ conversation.atType === "ALL" ? t("atAllTag") : t("atTag") }}
            </view>
            <view
              class="last-msg ellipsis"
              v-if="conversation.lastMessage?.type === 'txt'"
            >
              <span
                v-if="
                  conversation.conversationType === 'groupChat' &&
                  !conversation.lastMessage?.noticeInfo
                "
                >{{ getLastMsgFrom(conversation.lastMessage) }}:
              </span>
              <span
                :class="[{ 'emoji-wrap': item.type !== 'text' }]"
                v-for="(item, idx) in renderTxt(conversation.lastMessage.msg)"
                :key="idx"
              >
                <span v-if="item.type === 'text'"> {{ item.value }}</span>
                <!-- emoji -->
                <image v-else class="msg-emoji" :src="item.value" />
                <!-- emoji alt -->
                <!-- <span v-else> {{ item.alt }}</span> -->
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
        v-for="menu in currentMenuList"
        :key="menu.action"
        @click="handleMenuClick(menu.action)"
      >
        {{ menu.name }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../../components/Avatar/index.vue";
import { t } from "../../../../locales/index";
import { ref, onUnmounted, computed } from "vue";
import { ChatUIKit } from "../../../../index";
import { renderTxt, formatMessage } from "../../../../utils/index";
import { USER_AVATAR_URL, GROUP_AVATAR_URL } from "../../../../const/index";
import { autorun } from "mobx";
import {
  MixedMessageBody,
  Chat,
  UIKITConversationItem
} from "../../../../types";

interface Props {
  conversation: UIKITConversationItem;
  showMenu: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits(["mute", "pin", "delete", "leftSwipe"]);

let startX = 0;

const conversationInfo = ref<any>({});

const isMute = ref<Boolean>(false);

const isTapDelete = ref<Boolean>(false);

const featureConfig = ChatUIKit.getFeatureConfig();

const getLastMsgFrom = (msg: MixedMessageBody) => {
  if (props.conversation.conversationType === "groupChat") {
    const from = msg.from || ChatUIKit.getChatConn().user;
    const nickname = ChatUIKit.appUserStore.getUserInfoFromStore(from).nickname;
    if (nickname) {
      return nickname;
    }
    if (msg.ext?.ease_chat_uikit_user_info.nickname) {
      return msg.ext.ease_chat_uikit_user_info.nickname;
    }
    return from;
  } else {
    return "";
  }
};

const menuList = computed(() => {
  let list: any[] = [];
  if (featureConfig.muteConversation) {
    list.push({
      name: isMute.value ? t("unmute") : t("mute"),
      action: "mute",
      class: "mute"
    });
  }
  if (featureConfig.pinConversation) {
    list.push({
      name: props.conversation.isPinned ? t("unpin") : t("pin"),
      action: "pin",
      class: "pin"
    });
  }

  if (featureConfig.deleteConversation) {
    list.push({
      name: t("deleteConv"),
      action: "delete",
      class: "delete"
    });
  }

  return list;
});

const confirmDeleteMenu = ref([
  {
    name: t("confirmDeleteConv"),
    action: "confirmDelete",
    class: "confirm-delete"
  }
]);

const currentMenuList = computed(() => {
  return isTapDelete.value ? confirmDeleteMenu.value : menuList.value;
});

const uninstallIsMuteWatch = autorun(() => {
  isMute.value = ChatUIKit.convStore.getConversationMuteStatus(
    props.conversation.conversationId
  );
});

const uninstallConvInfoWatch = autorun(() => {
  const convId = props.conversation.conversationId;
  if (props.conversation.conversationType === "groupChat") {
    const groupInfo = ChatUIKit.groupStore.getGroupInfoFromStore(convId);
    conversationInfo.value = {
      name: groupInfo?.groupName || convId,
      avatar: ChatUIKit.groupStore.getGroupAvatar(convId)
    };
  } else {
    return (conversationInfo.value =
      ChatUIKit.appUserStore.getUserInfoFromStore(convId));
  }
});

const { getConversationTime } = ChatUIKit.convStore;

const getAvatarPlaceholder = () => {
  return props.conversation.conversationType === "groupChat"
    ? GROUP_AVATAR_URL
    : USER_AVATAR_URL;
};

const toChatPage = () => {
  if (props.showMenu) {
    isTapDelete.value = false;
    emits("leftSwipe", null);
    return;
  }
  uni.navigateTo({
    url: `/ChatUIKit/modules/Chat/index?type=${props.conversation.conversationType}&id=${props.conversation.conversationId}`
  });
};

const formatLastMessage = (conversation: Chat.ConversationItem) => {
  return formatMessage(conversation.lastMessage as MixedMessageBody);
};

const handleMenuClick = (action: string) => {
  if (action === "mute") {
    emits("mute", props.conversation);
  } else if (action === "pin") {
    emits("pin", props.conversation);
  } else if (action === "delete") {
    isTapDelete.value = true;
    return;
  } else if (action === "confirmDelete") {
    emits("delete", props.conversation);
  }
  emits("leftSwipe", null);
  isTapDelete.value = false;
};

// 滑动开始
const touchStartHandler = (e) => {
  startX = e.touches[0].pageX;
};

// 滑动事件处理
const touchMoveHandler = (e) => {
  if (menuList.value.length === 0) return;
  const pageX = e.touches[0].pageX;
  const moveX = pageX - startX;

  if (Math.abs(moveX) < 60) return;

  if (moveX > 0) {
    emits("leftSwipe", null);
    isTapDelete.value = false;
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
.conversation-item-wrap {
  &:active {
    background-color: #f5f5f5;
  }
}
@import url("../../../../styles/common.scss");
@import url("./style.scss");
</style>
