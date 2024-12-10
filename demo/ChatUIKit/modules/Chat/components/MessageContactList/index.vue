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
            <view class="share">{{ t("shareContact") }}</view>
          </view>
        </view>
        <view class="content">
          <IndexedList class="contact-indexed-list" :options="contactList">
            <template v-slot:indexedItem="slotProps">
              <UserItem
                class="contact-item"
                :user="slotProps.item"
                @tap="onSelect(slotProps.item.userId)"
              />
            </template>
          </IndexedList>
        </view>
      </view>
    </Popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import Popup from "../../../../components/Popup/index.vue";
import IndexedList from "../../../../components/IndexedList/index.vue";
import UserItem from "../../../ContactList/components/UserItem/index.vue";
import { t } from "../../../../locales/index";
import { ChatUIKit } from "../../../../index";
import { Chat } from "../../../../sdk";
import { autorun } from "mobx";

const emits = defineEmits(["onSelect"]);
const popupRef = ref(null);

const contactList = ref<Chat.ContactItem[]>([]);

const unwatchContactList = autorun(() => {
  contactList.value = ChatUIKit.contactStore.contacts.map((contact) => ({
    ...contact,
    ...ChatUIKit.appUserStore.getUserInfoFromStore(contact.userId),
    id: contact.userId
  }));
});

const onSelect = (userId) => {
  emits("onSelect", [userId]);
  hidePopup();
};

const showPopup = () => popupRef.value.openPopup();

const hidePopup = () => popupRef.value.closePopup();

defineExpose({
  showPopup,
  hidePopup
});

onUnmounted(() => {
  unwatchContactList();
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

.contact-indexed-list {
  display: flex;
  box-sizing: border-box;
}

.share {
  color: #171a1c;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
}

.contact-item {
  display: flex;
  width: 100vw;
}

.arrow-left {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/arrow-left.png") no-repeat;
  background-size: 100% 100%;
}
</style>
