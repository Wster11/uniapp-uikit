const locales = {
  "zh-Hans": {
    loginTitle: "登录环信IM",
    loginUserIdPlaceholder: "请输入环信UserId",
    loginPasswordPlaceholder: "请输入密码",
    loginLoadingTitle: "登录中...",
    loginPhoneIdPlaceholder: "请输入手机号",
    loginCodePlaceholder: "请输入验证码",
    getCodeSuccess: "发送验证码成功",
    getCode: "发送验证码",
    telNumberError: "请输入正确的手机号!",
    getCodeFrequent: "发送验证码过于频繁,请稍后再试",
    getCodeReachLimit: "发送验证码次数已达上限",
    getCodeFailed: "发送验证码失败",
    loginFailed: "登录失败!",
    userIdOrPasswordError: "用户名或密码错误",
    codeError: "验证码错误",
    codeIsEmpty: "验证码不能为空",
    getCodeFirst: "请先发送验证码",
    privacyChecked: "请先同意隐私协议",
    agreeTo: "同意",
    privacyPolicy: "隐私协议",
    login: "登录",
    easemob: "环信",
    msyncUrl: "WebSocket url",
    restUrl: "Reset url",
    appkey: "Appkey",
    msyncUrlPlaceholder: "请输入WebSocket url",
    restUrlPlaceholder: "请输入Reset url",
    appkeyPlaceholder: "请输入Appkey",
    isUseCustomServer: "是否使用自定义服务器",
    setting: "设置",
    serverConfig: "服务器自定义配置",
    profileLoginGroupName: "登录",
    profileSettingGroupName: "设置",
    profileStatus: "在线状态",
    profileInfo: "个人信息",
    profileSetting: "通用",
    profileNotice: "消息通知",
    profilePrivacy: "隐私",
    profileAbout: "关于",
    profileLogout: "退出登录"
  },
  en: {
    loginTitle: "EaseMob IM",
    loginUserIdPlaceholder: "Please enter ChatIM UserId",
    loginPasswordPlaceholder: "Please enter password",
    loginLoadingTitle: "Logging in...",
    loginPhoneIdPlaceholder: "Enter phone number",
    loginCodePlaceholder: "Enter verification code",
    getCodeSuccess: "Verification code sent successfully",
    getCode: "Send Code",
    telNumberError: "Enter a valid phone number!",
    getCodeFrequent: "Too many requests, try again later",
    getCodeReachLimit: "Verification code request limit reached",
    getCodeFailed: "Failed to send verification code",
    loginFailed: "Login failed!",
    userIdOrPasswordError: "Incorrect username or password",
    codeError: "Incorrect verification code",
    codeIsEmpty: "Verification code cannot be empty",
    getCodeFirst: "Please send the verification code first",
    privacyChecked: "Please agree to the privacy policy first",
    agreeTo: "Agree to",
    privacyPolicy: "Privacy Policy",
    login: "Login",
    easemob: "ChatIM",
    msyncUrl: "WebSocket URL",
    restUrl: "REST URL",
    appkey: "App Key",
    msyncUrlPlaceholder: "Enter WebSocket URL",
    restUrlPlaceholder: "Enter REST URL",
    appkeyPlaceholder: "Enter App Key",
    isUseCustomServer: "Use custom server",
    setting: "Settings",
    serverConfig: "Server Configuration",
    profileLoginGroupName: "Login",
    profileSettingGroupName: "Settings",
    profileStatus: "Online Status",
    profileInfo: "Profile",
    profileSetting: "General",
    profileNotice: "Notification",
    profilePrivacy: "Privacy",
    profileAbout: "About",
    profileLogout: "Logout"
  }
};

const i18nConfig = locales[uni.getLocale() || "en"] || locales["zh-Hans"];

const t = (key: string) => {
  return i18nConfig[key];
};

export { t };
