<template>
  <view
    :class="['avatar', shape]"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <image
      class="image"
      :src="imageSrc"
      :alt="alt"
      @error="onError"
      @load="onLoad"
    >
    </image>
    <image
      v-if="isLoading"
      class="image loading-avatar"
      :src="placeholder"
    ></image>
    <view v-if="showPresence" class="presence-wrap">
      <view :class="['status', presenceClass]"></view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { ChatUIKit } from "../../index";
interface Props {
  src: string;
  alt?: string;
  size?: number;
  shape?: "circle" | "square";
  placeholder?: string;
  withPresence?: boolean;
  isOnline?: boolean;
  presenceExt?:
    | "Online"
    | "Offline"
    | "Away"
    | "Busy"
    | "Do Not Disturb"
    | string; // 自定义状态
}

const props = defineProps<Props>();

const isError = ref(false);
const isLoading = ref(true);

const featureConfig = ChatUIKit.getFeatureConfig();

const showPresence = computed(() => {
  return props.withPresence && featureConfig.usePresence;
});

const presenceClass = computed(() => {
  if (props.isOnline) {
    switch (props.presenceExt) {
      case "Online":
        return "online";
      case "Offline":
        return "offline";
      case "Away":
        return "leave";
      case "Busy":
        return "busy";
      case "Do Not Disturb":
        return "do-not-disturb";
      default:
        return "custom";
    }
  }
  return "offline";
});

const imageSrc = computed(() => {
  if (isError.value) {
    return props.placeholder;
  }
  return props.src || props.placeholder;
});
const size = props.size || 50; // 默认大小为50px
const shape = props.shape || ChatUIKit.getThemeConfig().avatarShape;

const onError = () => {
  isError.value = true;
};

const onLoad = () => {
  isLoading.value = false;
};
</script>

<style lang="scss" scoped>
.avatar {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.avatar .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image cover-view {
  width: 100%;
  text-align: center;
  color: #fff;
  background-color: rgba(107, 96, 99, 0.4);
  position: absolute;
  left: 50%;
  top: 66%;
  transform: translate(-50%, 0);
}

.avatar.circle {
  .image {
    border-radius: 50%;
  }
}

.avatar.square {
  border-radius: 4px;
}

.presence-wrap {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 20%;
  height: 20%;
  background: #fff;
  padding: 3px;
  border-radius: 50%;
  min-width: 8px;
  min-height: 8px;
}

.status {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.online {
  background-image: url("../../assets/presence/online.png");
  background-size: 100% 100%;
}

.offline {
  background-image: url("../../assets/presence/offline.png");
  background-size: 100% 100%;
}

.busy {
  background-image: url("../../assets/presence/busy.png");
  background-size: 100% 100%;
}

.leave {
  background-image: url("../../assets/presence/leave.png");
  background-size: 100% 100%;
}

.do-not-disturb {
  background-image: url("../../assets/presence/nodistribute.png");
  background-size: 100% 100%;
}

.custom {
  background-image: url("../../assets/presence/custom.png");
  background-size: 100% 100%;
}

.loading-avatar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>
