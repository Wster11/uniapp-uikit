<template>
  <view
    v-if="showActions && menuItems.length"
    :class="['message-popup-box', popupClassName]"
    :style="
      elementPosition == 'overstep'
        ? computedRightMenuStyle
        : { '--arrowPosition': arrowPosition, right: isSelf ? '0' : 'auto' }
    "
  >
    <view class="message-operate">
      <view
        class="operate-item"
        v-for="(menuItem, idx) in menuItems"
        :key="idx"
        @click.stop="menuItem.action(item, index)"
      >
        <image
          :src="menuItem.icon"
          mode="aspectFill"
          alt=""
          class="operate-item-icon"
        ></image>
        <view class="operate-item-txt">{{ menuItem.label }}</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import type { MixedMessageBody } from "../../../../types/index";
import { ChatUIKit } from "../../../../index";
import { ASSETS_URL } from "../../../../const/index";
import { renderTxt } from "../../../../utils/index";
import { t } from "../../../../locales";

const CopyIcon = ASSETS_URL + "icon/copy.png";
const RecallIcon = ASSETS_URL + "icon/recall.png";
const ReplyIcon = ASSETS_URL + "icon/reply.png";
const EditIcon = ASSETS_URL + "icon/edit.png";
const DeleteIcon = ASSETS_URL + "icon/delete.png";

interface Props {
  msg: MixedMessageBody;
  isSelected: boolean;
}

interface MenuItem {
  label: string;
  icon: string;
  action: () => void;
}
const props = defineProps<Props>();
const showActions = ref(false);
const elementPosition = ref("");
const elTop = ref(0);
const arrowPosition = ref("0px");
const menuItems = ref<Array<MenuItem>>([]);

const windowSize = ref({
  width: 0,
  height: 0
});

const isSelf = ChatUIKit.messageStore.checkMessageFromIsSelf(props.msg);

const setMenuItems = () => {
  const list: Array<MenuItem> = [];
  const currentTime = Date.now();
  const msgTime = props.msg.time;
  const recallLimit = 1000 * 60 * 2; // 撤回时间限制
  const isRecallAllowed =
    (props.msg.status === "sent" || props.msg.status === "read") &&
    currentTime - msgTime < recallLimit;
  const isMsgEditable =
    isSelf &&
    props.msg.type === "txt" &&
    props.msg.status !== "failed" &&
    props.msg.status !== "sending";
  const isMsgReplyable =
    props.msg.status !== "failed" && props.msg.status !== "sending";
  const featureConfig = ChatUIKit.getFeatureConfig();

  // 文本消息类型时显示 "复制"
  if (featureConfig.copyMessage && props.msg.type === "txt") {
    list.push({
      label: t("copyBtn"),
      icon: CopyIcon,
      action: copyMessage
    });
  }

  // 允许编辑的消息显示 "编辑"
  if (featureConfig.editMessage && isMsgEditable) {
    list.push({
      label: t("editBtn"),
      icon: EditIcon,
      action: editMessage
    });
  }

  // 非发送中和失败状态的消息显示 "回复"
  if (featureConfig.replyMessage && isMsgReplyable) {
    list.push({
      label: t("replyBtn"),
      icon: ReplyIcon,
      action: quoteMessage
    });
  }

  featureConfig.deleteMessage &&
    list.push({
      label: t("deleteBtn"),
      icon: DeleteIcon,
      action: deleteMessage
    });

  // 自己的消息可以显示可撤回的显示 "撤回"
  if (isSelf) {
    if (featureConfig.recallMessage && isRecallAllowed) {
      list.push({
        label: t("recallBtn"),
        icon: RecallIcon,
        action: recallMessage
      });
    }
  }

  // 更新菜单项
  menuItems.value = list;
};

// 获取窗口尺寸
onMounted(() => {
  uni.getSystemInfo({
    success: (res) => {
      windowSize.value = {
        width: res.windowWidth,
        height: res.windowHeight
      };
    }
  });
});

// 计算右侧菜单的样式
const computedRightMenuStyle = computed(() => {
  if (elementPosition.value === "overstep") {
    return {
      top: `${elTop.value}px`,
      right: 0
    };
  }
  return "";
});

const popupClassName = computed(() => {
  if (elementPosition.value === "nearTop") {
    return isSelf ? "right-up-box" : "left-up-box";
  } else if (elementPosition.value === "nearBottom") {
    return isSelf ? "right-down-box" : "left-down-box";
  }
  return "";
});

function handleLongPress(e, instance) {
  let currClientY = e.changedTouches[0].clientY;
  const query = uni.createSelectorQuery().in(instance);
  query
    .select(`#msg-bubble-${props.msg.id}`)
    .boundingClientRect((res) => {
      // arrowPosition.value = `${res.width / 2 - 8}px`;
      arrowPosition.value = "8px";
      if (res.top > 180) {
        elementPosition.value = "nearBottom";
      } else if (res.height > windowSize.value.height / 2) {
        if (res.top < 0) {
          elTop.value = -res.top + currClientY;
        } else {
          elTop.value = currClientY - res.top;
        }
        elementPosition.value = "overstep";
      } else {
        elementPosition.value = "nearTop";
      }
    })
    .exec();
  setMenuItems();
  setTimeout(() => {
    showActions.value = true;
  }, 100);
}

const copyMessage = () => {
  // 复制消息逻辑
  const text = renderTxt(props.msg.msg).reduce((prev, curr) => {
    return prev + (curr.type === "text" ? curr.value : curr.alt);
  }, "");

  uni.setClipboardData({
    data: text, //要被复制的内容
    success: () => {
      showActions.value = false;
    }
  });
};

const quoteMessage = () => {
  ChatUIKit.messageStore.setQuoteMessage(props.msg);
  showActions.value = false;
};

const editMessage = () => {
  ChatUIKit.messageStore.setEditingMessage(props.msg);
  showActions.value = false;
};

const deleteMessage = () => {
  ChatUIKit.messageStore.deleteMessage(
    {
      conversationType: props.msg.chatType,
      conversationId: ChatUIKit.convStore.getCvsIdFromMessage(props.msg)
    },
    props.msg
  );
};

const recallMessage = () => {
  ChatUIKit.messageStore.recallMessage(props.msg);
  showActions.value = false;
};

defineExpose({
  handleLongPress
});
</script>

<style lang="scss" scoped>
.message-popup-box {
  position: absolute;
  z-index: 99;
  background: #f9fafa;
  border-radius: 8px;
  box-shadow: 0px 4px 8px 0px rgba(26, 26, 26, 0.2),
    0px 1px 3px 0px rgba(77, 77, 77, 0.3);
  .message-operate {
    display: flex;
    flex-flow: row wrap;
    box-sizing: border-box;
    padding: 4px 0;
    max-width: 310px;

    .operate-item {
      padding: 0 10px;
      margin: 10px 0;
      .operate-item-icon {
        display: block;
        width: 32px;
        height: 32px;
        background-size: cover;
      }

      .operate-item-txt {
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        color: #171a1c;
        margin-top: 2px;
      }
    }
  }
}

.right-up-box,
.left-up-box {
  bottom: -75px;
}

.right-down-box,
.left-down-box {
  top: -90px;
}

.left-up-box:before {
  content: "";
  position: absolute;
  bottom: 98%;
  left: var(--arrowPosition);
  border: 8px solid transparent;
  border-bottom: 8px solid #f9fafa;
}

.left-down-box::before {
  content: "";
  position: absolute;
  top: 98%;
  left: var(--arrowPosition);
  border: 8px solid transparent;
  border-top: 8px solid #f9fafa;
}

.right-up-box:before {
  content: "";
  position: absolute;
  bottom: 98%;
  right: var(--arrowPosition);
  border: 8px solid transparent;
  border-bottom: 8px solid #f9fafa;
}

.right-down-box::before {
  content: "";
  position: absolute;
  top: 98%;
  right: var(--arrowPosition);
  border: 8px solid transparent;
  border-top: 8px solid #f9fafa;
}
</style>
