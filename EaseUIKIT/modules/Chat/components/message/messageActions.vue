<template>
  <view
    v-if="showActions"
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
import { EaseConnKit } from "../../../../index";
import CopyIcon from "../../../../assets/icon/copy.png";
import RecallIcon from "../../../../assets/icon/recall.png";
import ReplyIcon from "../../../../assets/icon/reply.png";
import EditIcon from "../../../../assets/icon/edit.png";
import DeleteIcon from "../../../../assets/icon/delete.png";
import { renderTxt } from "../../../../utils/index";

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

const isSelf =
  EaseConnKit.connStore.getChatConn().user === props.msg.from ||
  props.msg.from === "";

const setMenuItems = () => {
  const list: Array<MenuItem> = [];
  const time = new Date().getTime();
  const msgTime = props.msg.time;
  const recallTime = 1000 * 10;
  const isRecall = time - msgTime < recallTime;

  // 文本消息类型才显示 "复制"
  if (props.msg.type === "txt") {
    list.push(
      {
        label: "复制",
        icon: CopyIcon,
        action: copyMessage
      },
      {
        label: "编辑",
        icon: EditIcon,
        action: editMessage
      }
    );
  }

  // 回复消息
  list.push({
    label: "回复",
    icon: ReplyIcon,
    action: quoteMessage
  });

  // 自己的消息可以编辑、删除和撤回
  if (isSelf) {
    list.push({
      label: "删除",
      icon: DeleteIcon,
      action: deleteMessage
    });

    if (isRecall) {
      list.push({
        label: "撤回",
        icon: RecallIcon,
        action: recallMessage
      });
    }
  }
  menuItems.value = [...list];
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
  EaseConnKit.messageStore.setQuoteMessage(props.msg);
  showActions.value = false;
};

const editMessage = () => {};

const deleteMessage = () => {
  EaseConnKit.messageStore.deleteMessage(
    {
      conversationType: props.msg.chatType,
      conversationId: EaseConnKit.convStore.getCvsIdFromMessage(props.msg)
    },
    props.msg.id
  );
};

const recallMessage = () => {
  EaseConnKit.messageStore.recallMessage({
    mid: props.msg.id,
    to: EaseConnKit.convStore.getCvsIdFromMessage(props.msg),
    chatType: props.msg.chatType
  });
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
