<template>
  <view class="msg-text">
    <span class="msg">
      <span
        :class="[{ 'emoji-wrap': item.type !== 'text' }]"
        v-for="(item, idx) in data"
        :key="idx"
      >
        <span v-if="item.type === 'text'"> {{ item.value }}</span>
        <image v-else class="msg-emoji" :src="item.value" />
      </span>
    </span>
    <view
      v-if="props.msg.modifiedInfo"
      :class="['msg-edited-tag', { self: isSelf }]"
    >
      {{ t("messageEdited") }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Chat } from "../../../../types/index";
import { renderTxt } from "../../../../utils/index";
import { t } from "../../../../locales/index";
import { computed } from "vue";
import { ChatUIKit } from "../../../../index";

interface Props {
  msg: Chat.TextMsgBody;
}
const props = defineProps<Props>();

const data = computed(() => {
  return renderTxt(props.msg.msg);
});

const isSelf =
  props.msg.from === ChatUIKit.getChatConn().user || props.msg.from === "";
</script>

<style lang="scss" scoped>
@import url("../../../../styles/common.scss");

.emoji-wrap {
  vertical-align: middle;
}

.msg-text {
  text-align: left;
  overflow-y: auto;
  word-break: break-all;
  word-wrap: break-word;
  white-space: break-spaces;
  min-height: 18.5px;
}

.msg-edited-tag {
  font-size: 11px;
  line-height: 14px;
  color: #5270ad;
  text-align: right;
  margin-top: 8px;
}

.self {
  color: #f8f9fc;
}
</style>
