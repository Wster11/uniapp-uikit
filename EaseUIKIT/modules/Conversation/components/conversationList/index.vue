<template>
	<view class="conversation-list-wrap">
		<view v-if="conversationList.length">
			<view v-for="conv in conversationList" :key="conv.conversationId" :data-id="conv.conversationId"
				class="conversation-item-wrap" :class="{
          'conversation-item-wrap-selected':
            conv.conversationId === selectedConv.conversationId
        }">
				<ConversationItem :conversation="conv" />
			</view>
		</view>
		<view v-else class="conversation-empty">
			{{ t("conversationEmptyTip") }}
		</view>
	</view>
</template>

<script setup lang="ts">
	import ConversationItem from "../conversationItem/index.vue";
	import { ref, onUnmounted } from "vue";
	import type { EasemobChat } from "easemob-websdk";
	import { t } from "../../../../locales/index";
	import { EaseConnKit } from "../../../../index";
	import { autorun } from "mobx";
	import { deepClone } from "../../../../utils/index";
	const conversationList = ref<EasemobChat.ConversationItem[]>([]);
	const selectedConv = ref({} as EasemobChat.ConversationItem);


	const uninstallConvListWatch = autorun(() => {
		conversationList.value = deepClone(EaseConnKit.convStore.conversationList);
	});

	onUnmounted(() => {
		uninstallConvListWatch();
	});
</script>
<style lang="scss" scoped>
	@import url("./style.scss");
</style>