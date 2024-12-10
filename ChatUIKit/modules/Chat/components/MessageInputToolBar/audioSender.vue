<template>
  <view>
    <Popup :height="200" :maskClosable="maskClosable" ref="audioPopupRef">
      <view class="record-btn-wrap">
        <view class="btn-wrap">
          <view
            v-if="recordStatus === 'recordEnd'"
            class="reset-btn"
            @tap="resetRecording"
          ></view>
          <view
            :class="['record-btn', { ripple: isRecordingOrPlaying }]"
            @tap="toggleRecording"
          >
            <view v-if="recordStatus === 'record'" class="mic"></view>
            <view class="duration" v-else> {{ elapsedTime }} s</view>
          </view>
          <view
            v-if="recordStatus === 'recordEnd'"
            class="send-btn"
            @tap="uploadAndSendAudio"
          ></view>
        </view>
        <view class="record-txt">
          <span v-if="recordStatus === 'record'">
            {{ t("tapRecord") }}
          </span>
          <span v-if="recordStatus === 'recording'">
            {{ t("recording") }}
          </span>
          <span v-if="recordStatus === 'recordEnd'">
            {{ isPlaying ? t("playing") : t("tapPlay") }}
          </span>
        </view>
      </view>
    </Popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import Popup from "../../../../components/Popup/index.vue";
import { t } from "../../../../locales/index";
import { ChatUIKit } from "../../../../index";
import { chatSDK } from "../../../../sdk";
import { logger } from "../../../../log";

type RecordStatus = "record" | "recording" | "recordEnd";

const audioPopupRef = ref(null);
const conn = ChatUIKit.getChatConn();
const convStore = ChatUIKit.convStore;
const recordStatus = ref<RecordStatus>("record");
const recorder = ref<UniApp.RecorderManager>();
const startTime = ref<number>(0);
const duration = ref<number>(0);
const isPlaying = ref(false);
const audioFilePath = ref("");
const maskClosable = computed(() => {
  return recordStatus.value === "record";
});

let audioContext: UniApp.InnerAudioContext | null = null;

let timerId: any = 0;

// 最大录音时长
const MAX_RECORD_DURATION = 1000 * 60;

// 计算已经录制的时长
const elapsedTime = computed(() => Math.floor(duration.value / 1000));

// 判断是否正在录音或播放
const isRecordingOrPlaying = computed(
  () => recordStatus.value === "recording" || isPlaying.value
);

// 显示和隐藏弹窗的函数
const showAudioPopup = () => audioPopupRef.value.openPopup();
const hideAudioPopup = () => audioPopupRef.value.closePopup();

// 开始录音
const startRecording = () => {
  ChatUIKit.messageStore.setPlayingAudioMessageId(""); // 清空播放的音频
  duration.value = 0;
  startTime.value = Date.now();
  recordStatus.value = "recording";
  timerId = setInterval(() => {
    if (recordStatus.value === "recording") {
      duration.value = Date.now() - startTime.value;
      // 添加时长检查
      if (duration.value >= MAX_RECORD_DURATION) {
        stopRecording();
      }
    }
  }, 1000);
  uni.vibrateShort(); // 短暂震动提示
  recorder.value?.start({ format: "mp3" });
};

// 停止录音
const stopRecording = () => {
  duration.value = Date.now() - startTime.value;
  startTime.value = 0;
  recordStatus.value = "recordEnd";
  recorder.value?.stop();
  clearInterval(timerId);
};

// 重置录音状态
const resetRecording = () => {
  recordStatus.value = "record";
  duration.value = 0;
  audioFilePath.value = "";
  toggleAudioPlayback(true);
};

// 切换录音或音频播放
const toggleRecording = () => {
  switch (recordStatus.value) {
    case "record":
      startRecording();
      break;
    case "recording":
      stopRecording();
      break;
    case "recordEnd":
      toggleAudioPlayback();
      break;
  }
};

// 切换音频播放状态
const toggleAudioPlayback = (forceStop: boolean = false) => {
  if (forceStop || isPlaying.value) {
    audioContext?.stop();
  } else {
    if (!audioContext) {
      createAudioContext(); // 创建新的 audioContext
    }
    audioContext.src = audioFilePath.value;
    audioContext.play();
  }
};

// 创建音频上下文
const createAudioContext = () => {
  audioContext = uni.createInnerAudioContext();
  // 设置音频选项（在 MP 平台上）
  // #ifdef MP
  uni.setInnerAudioOption({
    obeyMuteSwitch: false
  });
  // #endif

  audioContext.onPlay(() => (isPlaying.value = true));
  audioContext.onStop(() => (isPlaying.value = false));
  audioContext.onPause(() => (isPlaying.value = false));
  audioContext.onError((e) => {
    isPlaying.value = false;
    console.warn("audio play error", e);
  });
  audioContext.onEnded(() => (isPlaying.value = false));
};

// 上传并发送音频
const uploadAndSendAudio = () => {
  if (!audioFilePath.value) return;
  const uploadUrl = `${conn.apiUrl}/${conn.orgName}/${conn.appName}/chatfiles`;
  const file = audioFilePath.value;
  const audioLength = elapsedTime.value;

  hideAudioPopup();

  const token = conn.token;
  const requestParams = {
    url: uploadUrl,
    filePath: file,
    name: "file",
    header: { Authorization: "Bearer " + token }
  };
  const audioMsg = chatSDK.message.create({
    type: "audio",
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    filename: "audio.mp3",
    body: {
      url: file,
      filename: "audio.mp3",
      type: "mp3",
      //@ts-ignore
      length: audioLength
    },
    ext: {
      ease_chat_uikit_user_info: {
        avatarURL: ChatUIKit.appUserStore.getSelfUserInfo().avatar,
        nickname: ChatUIKit.appUserStore.getSelfUserInfo().name
      }
    }
  });
  ChatUIKit.messageStore.sendMessage(audioMsg, () => {
    return uni.uploadFile(requestParams);
  });
  resetRecording();
};

// 在组件挂载时，初始化录音管理器
onMounted(() => {
  recorder.value = uni.getRecorderManager();
  recorder.value?.onStart(() => {
    logger.log("recording start");
  });
  recorder.value?.onError(() => {
    logger.log("recording error");
  });
  recorder.value?.onStop((res) => {
    logger.log("recording stop");
    audioFilePath.value = res.tempFilePath;
  });
});

// 在组件卸载时，清理音频资源
onUnmounted(() => {
  if (isPlaying.value) {
    audioContext?.stop();
  }
  audioContext?.destroy?.();
});

defineExpose({
  showAudioPopup,
  hideAudioPopup
});
</script>

<style lang="scss" scoped>
@keyframes ripple {
  0% {
    box-shadow: 0 0 0 5px #e5f5ff;
  }
  50% {
    box-shadow: 0 0 0 10px #e5f5ff;
  }
  100% {
    box-shadow: 0 0 0 5px #e5f5ff;
  }
}

.record-btn-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 200px;
}

.btn-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ripple {
  animation: ripple 1.5s infinite;
}

.record-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 48px;
  background-color: #009dff;
  border-radius: 30px;
  box-shadow: 0 0 0 8px #e5f5ff;
}

.mic {
  width: 24px;
  height: 24px;
  background-image: url("../../../../assets/icon/mic_on.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center center;
}

.record-txt {
  color: #75828a;
  font-size: 14px;
  line-height: 18px;
  margin-top: 16px;
}

.duration {
  font-size: 16px;
  line-height: 22px;
  color: #f9fafa;
}

.reset-btn {
  width: 36px;
  height: 36px;
  background-color: #e3e6e8;
  border-radius: 50%;
  background-image: url("../../../../assets/icon/trash.png");
  background-size: 24px 24px;
  background-repeat: no-repeat;
  background-position: center center;
  margin-right: 60px;
}

.send-btn {
  width: 36px;
  height: 36px;
  background-color: #009dff;
  border-radius: 50%;
  background-image: url("../../../../assets/icon/airplane.png");
  background-size: 24px 24px;
  background-repeat: no-repeat;
  background-position: center center;
  margin-left: 60px;
}
</style>
