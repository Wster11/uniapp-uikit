<template>
  <view>
    <Popup
      :height="500"
      :borderRadius="'10px'"
      :maskClosable="true"
      ref="popupRef"
    >
      <view class="content-wrap">
        <view class="header">
          <view class="left" @tap="hidePopup">
            <view class="arrow-left"></view>
            <view class="mention">{{ t("mention") }}</view>
          </view>
        </view>
        <view class="content">
          <scroll-view scroll-y style="height: 100%" @scrolltolower="loadMore">
            <UserItem
              v-for="item in memberList"
              :key="item.userId"
              :contact="{ userId: item.member || item.owner }"
              @tap="onSelect(item.member || item.owner)"
            />
          </scroll-view>
        </view>
      </view>
    </Popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Popup from "../../../common/popup/index.vue";
import UserItem from "../../../ContactList/components/userItem/index.vue";
import { t } from "../../../../locales/index";
import { ChatUIKIT } from "../../../../index";
import { Chat } from "../../../../sdk";
import { GET_GROUP_MEMBERS_PAGESIZE } from "../../../../const/index";

const emits = defineEmits(["onSelect"]);
const memberList = ref<Chat.GroupMember[]>([]);
const groupId = ChatUIKIT.convStore.currConversation?.conversationId || "";
const hasMore = ref(true);
const popupRef = ref(null);

let loading = false;
let pageNum = 1;

const listGroupMembers = async () => {
  loading = true;
  try {
    const res = await ChatUIKIT.groupStore.getGroupMembers(groupId, pageNum);
    const dt = res.data || [];
    memberList.value.push(...dt);

    // 如果返回的数据小于每页的数量，说明没有更多数据了
    if (dt.length < GET_GROUP_MEMBERS_PAGESIZE) {
      hasMore.value = false;
    }
    loading = false;
  } catch (error) {
    loading = false;
  }
};

// 加载更多
const loadMore = () => {
  if (loading || hasMore.value === false) {
    return;
  }
  pageNum++;
  listGroupMembers();
};

const showPopup = () => {
  popupRef.value.openPopup();
  if (memberList.value.length === 0) {
    listGroupMembers();
  }
};

const onSelect = (userId) => {
  emits("onSelect", [userId]);
  hidePopup();
};

const hidePopup = () => popupRef.value.closePopup();

defineExpose({
  showPopup,
  hidePopup
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  height: 44px;
  padding: 8px;
  justify-content: space-between;
  align-items: center;
}

.content-wrap {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.content {
  flex: 1;
  overflow-y: auto;
}

.left {
  display: flex;
  align-items: center;
}

.mention {
  color: #171a1c;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
}

.arrow-left {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/arrow-left.png") no-repeat;
  background-size: 100% 100%;
}
</style>
