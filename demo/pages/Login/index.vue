<template>
  <view class="login-wrap">
    <view class="login-header">
      <text class="login-title">登录环信IM</text>
      <view class="version" @tap="times++">V1.0.0</view>
    </view>
    <!-- 用户名密码登录 -->
    <view v-if="isPasswordLogin" class="login-form-warp">
      <view class="input-wrap">
        <input
          class="input"
          v-model="userId"
          :placeholder="t('loginUserIdPlaceholder')"
        />
      </view>
      <view class="input-wrap">
        <input
          class="input"
          type="password"
          v-model="password"
          :placeholder="t('loginPasswordPlaceholder')"
        />
      </view>
    </view>
    <!-- 手机号验证码登录 -->
    <view v-else class="login-form-wrap">
      <view class="input-wrap">
        <input
          class="input"
          v-model="tel"
          type="number"
          maxlength="11"
          :placeholder="t('loginPhoneIdPlaceholder')"
        />
      </view>
      <view class="input-wrap">
        <input
          class="input"
          v-model="code"
          type="number"
          maxlength="6"
          :placeholder="t('loginCodePlaceholder')"
        />
        <text size="mini" type="primary" class="get-code" @tap="getCode">
          {{ counter === 60 ? t("getCode") : counter }}
        </text>
      </view>
    </view>
    <button class="login-btn" type="primary" @tap="loginIM">
      {{ t("login") }}
    </button>
    <view class="private-wrap">
      <checkbox-group @change="checkboxChange">
        <label class="label">
          <checkbox
            backgroundColor="#f9fafa"
            borderColor="#ACB4B9"
            activeBackgroundColor="#009DFF"
            activeBorderColor="#009DFF"
            style="transform: scale(0.8)"
            iconColor="#fff"
            value="true"
            :checked="privacyChecked"
          />
          {{ t("agreeTo") }}
          <a class="privacy" @tap="toPrivacy">《{{ t("privacyPolicy") }}》</a>
        </label>
      </checkbox-group>
    </view>
    <view
      v-if="times > 5 || IS_USE_CUSTOM_SERVER"
      class="server-config"
      @tap="toServerConfig"
    >
      {{ t("serverConfig") }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { t } from "../../const/locales";
import { CHAT_STORE, IS_USE_CUSTOM_SERVER } from "@/const/index";

// 基础数据
let disabled = false;
const counter = ref(60);
const timer = ref<number | null>(null);
const userId = ref("");
const password = ref("");
const tel = ref("");
const code = ref("");
const privacyChecked = ref(false);
const times = ref(0);

// const isPasswordLogin = ref(!!IS_USE_CUSTOM_SERVER);

// 是否使用密码登录
const isPasswordLogin = ref(true);

// 启动倒计时
const startCount = () => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  disabled = true;
  counter.value = 60;
  timer.value = setInterval(() => {
    counter.value--;
    if (counter.value <= 0) {
      clearInterval(timer.value as number);
      counter.value = 60;
      disabled = false;
      timer.value = null;
    }
  }, 1000);
};

// 获取验证码
const getCode = async () => {
  if (disabled) {
    return;
  }
  if (!/^1[3456789]\d{9}$/.test(tel.value)) {
    uni.showToast({
      title: t("telNumberError"),
      icon: "none"
    });
    return;
  }

  try {
    startCount();
    const res: any = await uni.request({
      url: `https://a1.easemob.com/inside/app/sms/send/${tel.value}`,
      header: { "content-type": "application/json" },
      method: "POST",
      data: { phoneNumber: tel.value }
    });

    if (res.statusCode === 200) {
      uni.showToast({ title: t("getCodeSuccess"), icon: "none" });
    } else if (res.statusCode === 400) {
      handleGetCodeError(res.data.errorInfo);
    } else {
      uni.showToast({ title: t("getCodeFailed"), icon: "none" });
    }
  } catch (error) {
    console.error(error);
    uni.showToast({ title: t("getCodeFailed"), icon: "none" });
  }
};

// 处理验证码获取错误信息
const handleGetCodeError = (errorInfo: string) => {
  const messages: Record<string, string> = {
    "phone number illegal": t("telNumberError"),
    "Please wait a moment while trying to send.": t("getCodeFrequent"),
    "exceed the limit": t("getCodeReachLimit")
  };
  const message = messages[errorInfo] || errorInfo;
  uni.showToast({ title: message, icon: "none" });
};

// 登录逻辑（用户名密码登录）
const loginWithPassword = () => {
  uni.showLoading({
    title: t("loginLoadingTitle")
  });
  uni.$UIKit.chatStore
    .login({
      user: userId.value,
      pwd: password.value // 密码登录
      // accessToken: "" // token登录
    })
    .then((res) => {
      uni.setStorage({
        key: CHAT_STORE,
        data: {
          userId: userId.value,
          token: res.accessToken
        }
      });
      // 跳转会话列表页面
      uni.switchTab({
        url: "/ChatUIKit/modules/Conversation/index"
      });
    })
    .catch((e) => {
      uni.showToast({
        title: e?.data?.data?.error_description,
        icon: "none"
      });
    })
    .finally(() => {
      uni.hideLoading();
    });
};

// 登录逻辑（手机号验证码登录）
const loginWithTel = async () => {
  uni.showLoading({
    title: t("loginLoadingTitle")
  });
  try {
    const res: any = await uni.request({
      url: "https://a1.easemob.com/inside/app/user/login/V2",
      header: {
        "content-type": "application/json"
      },
      method: "POST",
      data: {
        phoneNumber: tel.value,
        smsCode: code.value
      }
    });

    if (res.statusCode == 200) {
      const { token, chatUserName } = res.data;
      uni.$UIKit.chatStore
        .login({
          user: chatUserName,
          accessToken: token
        })
        .then((res) => {
          uni.setStorage({
            key: CHAT_STORE,
            data: {
              userId: chatUserName,
              token: res.accessToken
            }
          });
          // 跳转会话列表页面
          uni.switchTab({
            url: "/ChatUIKit/modules/Conversation/index"
          });
        })
        .finally(() => {
          uni.hideLoading();
        });
    } else if (res.statusCode == 400) {
      if (res.data.errorInfo) {
        switch (res.data.errorInfo) {
          case "UserId password error.":
            uni.showToast({
              title: t("userIdOrPasswordError"),
              icon: "none"
            });
            break;
          case "phone number illegal":
            uni.showToast({
              title: t("telNumberError"),
              icon: "none"
            });
            break;
          case "SMS verification code error.":
            uni.showToast({
              title: t("codeError"),
              icon: "none"
            });
            break;
          case "Sms code cannot be empty":
            uni.showToast({
              title: t("codeIsEmpty"),
              icon: "none"
            });
            break;
          case "Please send SMS to get mobile phone verification code.":
            uni.showToast({
              title: t("getCodeFirst"),
              icon: "none"
            });
            break;
          default:
            uni.showToast({
              title: res.data.errorInfo,
              icon: "none"
            });
            break;
        }
      }
    }
  } catch (error) {
    uni.showToast({
      title: t("loginFailed"),
      icon: "none"
    });
  }
};

// 登录入口
const loginIM = () => {
  if (!privacyChecked.value) {
    uni.showToast({ title: t("privacyChecked"), icon: "none" });
    return;
  }
  if (isPasswordLogin.value) {
    loginWithPassword();
  } else {
    loginWithTel();
  }
};

const toPrivacy = () => {
  const url = "https://www.easemob.com/terms";
  // #ifdef APP-PLUS
  plus.runtime.openURL(url);
  // #endif
  // #ifdef WEB
  window.open(url);
  // #endif
};

const checkboxChange = (e: any) => {
  privacyChecked.value = !!e.detail.value[0];
};
const toServerConfig = () => {
  uni.navigateTo({ url: "../ServerConfig/index" });
};

// 清除定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style lang="scss" scoped>
@import url("./style.scss");
</style>
