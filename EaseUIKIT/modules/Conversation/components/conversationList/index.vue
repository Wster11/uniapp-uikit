<template>
  <view class="conversation-list-wrap">
    <view v-if="conversationList.length">
      <view
        v-for="conv in conversationList"
        :key="conv.conversationId"
        :data-id="conv.conversationId"
        @longpress="onLongPress"
      >
        <ConversationItem :conversation="conv" />
      </view>
    </view>
    <view v-else class="conversation-empty">
      {{ t("conversationEmptyTip") }}
    </view>
    <Popup ref="popup" :height="250">
      <MenuItem
        :name="isMuteSelectedConv ? t('unmute') : t('mute')"
        key="1"
        @click="onMuteButtonClick"
      />
      <MenuItem
        :name="selectedConv.isPinned ? t('unpin') : t('pin')"
        @click="pinConversation(!selectedConv.isPinned)"
        key="2"
      />
      <MenuItem
        className="dangerous-btn"
        :name="t('deleteConv')"
        @click="deleteConversation"
        key="4"
        :hideDivider="true"
      />
      <Divider :height="8" />
      <MenuItem
        :name="t('cancel')"
        @click="closePopup"
        key="4"
        :hideDivider="true"
      />
    </Popup>
  </view>
</template>

<script setup lang="ts">
import ConversationItem from "../conversationItem/index.vue";
import Popup from "../../../common/popup/index.vue";
import MenuItem from "../../../common/menuItem/index.vue";
import Divider from "../../../common/divider/index.vue";
import { ref, computed, onUnmounted } from "vue";
import type { EasemobChat } from "easemob-websdk";
import { t } from "../../../../locales/index";
import { EaseConnKit } from "../../../../index";
import { autorun } from "mobx";
import { deepClone } from "../../../../utils/index";

const popup = ref(null);
const isMuteSelectedConv = ref(false);

const closePopup = () => {
  popup.value.closePopup();
};

const onLongPress = (e: any) => {
  let [touches, style, conversationId] = [
    e.touches[0],
    "",
    e.currentTarget.dataset.id
  ];
  selectedConv.value = EaseConnKit.convStore.conversationList.find(
    (conv) => conv.conversationId === conversationId
  ) as EasemobChat.ConversationItem;
  isMuteSelectedConv.value = EaseConnKit.convStore.muteConvsMap.get(
    selectedConv.value.conversationId
  );
  popup.value.openPopup();
};

const conversationList = ref<EasemobChat.ConversationItem[]>([]);
const selectedConv = ref({} as EasemobChat.ConversationItem);
const uninstallConvListWatch = autorun(() => {
  conversationList.value = deepClone(EaseConnKit.convStore.conversationList);
});

const deleteConversation = () => {
  EaseConnKit.convStore.deleteConversation(selectedConv.value);
  closePopup();
};

const muteConversation = () => {
  EaseConnKit.convStore.setSilentModeForConversation(selectedConv.value);
  closePopup();
};

const unMuteConversation = () => {
  EaseConnKit.convStore.clearRemindTypeForConversation(selectedConv.value);
  closePopup();
};

const pinConversation = (isPined: boolean) => {
  EaseConnKit.convStore.pinConversation(selectedConv.value, isPined);
  closePopup();
};

const onMuteButtonClick = () => {
  if (isMuteSelectedConv.value) {
    unMuteConversation();
  } else {
    muteConversation();
  }
};

onUnmounted(() => {
  uninstallConvListWatch();
});
</script>
<style lang="scss" scoped>
@import url("../../../../styles//common.scss");
@import url("./style.scss");
.dangerous-btn {
  color: #ff002b;
}
</style>
