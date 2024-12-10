<template>
  <view class="msg-audio">
    <view class="content-wrap" @tap="toggle">
      <view
        class="content"
        v-if="isSelf"
        :style="{ width: (props.msg.length || 0) * 10 + 'px' }"
      >
        <view> {{ props.msg.length }}'' </view>
        <image
          class="image"
          :src="playing ? SendAudioPlayingIcon : SendAudioIcon"
          mode="aspectFit"
        />
      </view>
      <view
        class="content"
        v-else
        :style="{ width: (props.msg.length || 0) * 5 + 'px' }"
      >
        <image
          class="image"
          :src="playing ? ReceiveAudioPlayingIcon : ReceiveAudioIcon"
          mode="aspectFit"
        />
        <view> {{ props.msg.length }}''</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Chat } from "../../../../types/index";
import { ChatUIKit } from "../../../../index";
import { ASSETS_URL } from "../../../../const/index";
import { ref, onUnmounted, watch } from "vue";

const ReceiveAudioIcon = ASSETS_URL + "icon/receiveAudio.png";
const SendAudioIcon = ASSETS_URL + "icon/sendAudio.png";
const SendAudioPlayingIcon = ASSETS_URL + "icon/sendAudioPlaying.gif";
const ReceiveAudioPlayingIcon = ASSETS_URL + "icon/receiveAudioPlaying.gif";

interface Props {
  msg: Chat.AudioMsgBody;
}
const conn = ChatUIKit.getChatConn();
const props = defineProps<Props>();
const audioContextMap = new Map<string, UniApp.InnerAudioContext>();
const playing = ref(false);
const isSelf = ChatUIKit.messageStore.checkMessageFromIsSelf(props.msg);
const messageStore = ChatUIKit.messageStore;

const toggle = async () => {
  const audioContext = getAudioContext();
  if (!audioContext) {
    const context = uni.createInnerAudioContext();
    audioContextMap.set("audio", context);
    // #ifdef MP
    uni.setInnerAudioOption({
      obeyMuteSwitch: false
    });
    // #endif
    initAudio();
    // 必须绑定完事件后再设置src， 否则会导致事件不触发
    context.src = await formatAudioToMp3();
  }
  toggleAudio();
};

const formatAudioToMp3 = () => {
  // 如果消息状态为发送中，则直接使用本地的音频url
  if (props.msg.status === "sending") {
    return props.msg.url;
  }
  return new Promise<string>((resolve, reject) => {
    const { url } = props.msg;
    uni.downloadFile({
      url: url || "",
      header: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "audio/mp3",
        Authorization: "Bearer " + conn.token
      },

      success: (res) => {
        const tempFilePath = res.tempFilePath;
        resolve(tempFilePath);
      },

      fail: (e) => {
        console.warn("downloadFile failed", e);
        reject(e);
        uni.showToast({
          title: "语音转mp3失败",
          duration: 2000
        });
      }
    });
  });
};

const initAudio = () => {
  const audioContext = getAudioContext();
  if (!audioContext) {
    return;
  }

  playing.value = false;
  audioContext.onPlay(() => {
    playing.value = true;
  });

  audioContext.onStop(() => {
    playing.value = false;
  });

  audioContext.onPause(() => {
    playing.value = false;
  });

  audioContext.onError((e) => {
    playing.value = false;
    console.warn("audio play error", e);
  });

  audioContext.onEnded(() => {
    playing.value = false;
  });
};

const toggleAudio = () => {
  if (playing.value) {
    stop();
  } else {
    messageStore.setPlayingAudioMessageId(props.msg.id);
    play();
  }
};

const play = () => {
  getAudioContext()?.play();
};

const stop = () => {
  getAudioContext()?.stop();
};

const getAudioContext = () => {
  return audioContextMap.get("audio");
};

watch(
  () => messageStore.playingAudioMsgId,
  (newVal) => {
    if (newVal !== props.msg.id) {
      stop();
      playing.value = false;
    }
  }
);

onUnmounted(() => {
  const audioContext = getAudioContext();
  if (playing.value) {
    stop();
  }
  audioContext?.destroy?.();
  audioContextMap.delete("audio");
});
</script>

<style lang="scss" scoped>
.image {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.content {
  display: flex;
  align-items: center;
  min-width: 50px;
  max-width: 120px;
  line-height: 100%;
  justify-content: space-between;
}
</style>
