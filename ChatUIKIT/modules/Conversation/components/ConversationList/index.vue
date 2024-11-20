<template>
  <view class="conversation-list-wrap">
    <view v-if="conversationList.length">
      <view class="header-wrap">
        <NavBar :showBackArrow="false">
          <template v-slot:left>
            <Avatar
              :size="32"
              :src="userInfo.avatar"
              :placeholder="USER_AVATAR_URL"
            />
          </template>
          <template v-slot:center>
            <view class="title"></view>
          </template>
          <template v-slot:right>
            <view class="btn-wrap" @tap="isShowPopMenu = true">
              <view class="action-btn"></view>
            </view>
          </template>
        </NavBar>
        <SearchButton @tap="onSearch" />
      </view>
      <PopMenu
        v-if="isShowPopMenu"
        :options="options"
        :popStyle="PopMenuStyle"
        @onMenuTap="handleMenuTap"
        @onMenuClose="isShowPopMenu = false"
      />
      <view class="convs-wrap">
        <view
          v-for="conv in conversationList"
          :key="conv.conversationId"
          :data-id="conv.conversationId"
        >
          <ConversationItem
            :conversation="conv"
            :showMenu="
              selectedConvId ? selectedConvId === conv.conversationId : false
            "
            @mute="onMuteButtonClick"
            @pin="pinConversation"
            @delete="deleteConversation"
            @leftSwipe="handleLeftSwipe"
          />
        </view>
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../common/Avatar/index.vue";
import NavBar from "../../../common/NavBar/index.vue";
import PopMenu from "../../../common/PopMenu/index.vue";
import ConversationItem from "../ConversationItem/index.vue";
import SearchButton from "../../../common/SearchButton/index.vue";
import Empty from "../../../common/Empty/index.vue";
import ChatMenuIcon from "../../../../assets/icon/chat.png";
import AddContactMenuIcon from "../../../../assets/icon/addContact.png";
import CreateGroupIcon from "../../../../assets/icon/createGroup.png";
import { ref, onUnmounted } from "vue";
import type { Chat } from "../../../../types/index";
import { ChatUIKIT } from "../../../../index";
import { deepClone } from "../../../../utils/index";
import { USER_AVATAR_URL } from "../../../../const";
import { autorun } from "mobx";

const selectedConvId = ref<Chat.ConversationItem | null>(null);
const conversationList = ref<Chat.ConversationItem[]>([]);
const isShowPopMenu = ref(false);

const PopMenuStyle = {
  right: "25px",
  top: "calc(var(--status-bar-height) + 50px"
};

const userInfo = ref({});

const options = [
  {
    name: "发起新会话",
    type: "newConversation",
    icon: ChatMenuIcon
  },
  {
    name: "添加联系人",
    type: "createGroup",
    icon: AddContactMenuIcon
  },
  {
    name: "创建群组",
    type: "createGroup",
    icon: CreateGroupIcon
  }
];

const uninstallConvListWatch = autorun(() => {
  conversationList.value = deepClone(ChatUIKIT.convStore.conversationList);
});

const unwatchUserInfo = autorun(() => {
  userInfo.value = ChatUIKIT.appUserStore.getSelfUserInfo();
});

const deleteConversation = (conv: Chat.ConversationItem) => {
  ChatUIKIT.convStore.deleteConversation(conv);
};

const muteConversation = (conv: Chat.ConversationItem) => {
  ChatUIKIT.convStore.setSilentModeForConversation(conv);
};

const unMuteConversation = (conv: Chat.ConversationItem) => {
  ChatUIKIT.convStore.clearRemindTypeForConversation(conv);
};

const pinConversation = (conv: Chat.ConversationItem) => {
  ChatUIKIT.convStore.pinConversation(conv, !conv.isPinned);
};

const onMuteButtonClick = (conv: Chat.ConversationItem) => {
  const isMute = ChatUIKIT.convStore.getConversationMuteStatus(
    conv.conversationId
  );
  if (isMute) {
    unMuteConversation(conv);
  } else {
    muteConversation(conv);
  }
};

const handleMenuTap = (params) => {
  switch (params.type) {
    case "newConversation":
      uni.navigateTo({
        url: "/ChatUIKIT/modules/ChatNew/index"
      });
      break;
    case "createGroup":
      uni.navigateTo({
        url: "/ChatUIKIT/modules/GroupCreate/index"
      });
      break;
    default:
      break;
  }
};

const handleLeftSwipe = (convId: string | null) => {
  selectedConvId.value = convId;
};

const onSearch = () => {
  uni.navigateTo({
    url: "/ChatUIKIT/modules/ConversationSearchList/index"
  });
};

onUnmounted(() => {
  uninstallConvListWatch();
  unwatchUserInfo();
});
</script>
<style lang="scss" scoped>
.title {
  width: 50px;
  height: 22px;
  background: url("../../../../assets/chat.png") no-repeat;
  background-size: 100% 100%;
}

.btn-wrap {
  display: flex;
  width: 32px;
  justify-content: flex-end;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/plus.png") no-repeat;
  background-size: 100% 100%;
}

.header-wrap {
  position: fixed;
  z-index: 999;
  padding: 8px;
  width: 100%;
  background: #f9fafa;
  box-sizing: border-box;
}

.convs-wrap {
  padding-top: 52px;
}

@import url("../../../../styles//common.scss");
@import url("./style.scss");
.dangerous-btn {
  color: #ff002b;
}
</style>
