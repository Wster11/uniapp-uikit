import { t } from "../locales/index";
import { emojiAltMap, emoji } from "../const/emoji";
import { MixedMessageBody } from "../types";
import { pinyin } from "pinyin-pro";

export const formatDate = function (date: Date, fmt: string = "") {
  const o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (let k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        //@ts-ignore
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};

export const getTimeStringAutoShort = function (
  timestamp: number,
  mustIncludeTime?: boolean
) {
  // 当前时间
  let currentDate = new Date();
  // 目标判断时间
  let srcDate = new Date(parseInt(timestamp as any));

  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth() + 1;
  let currentDateD = currentDate.getDate();

  let srcYear = srcDate.getFullYear();
  let srcMonth = srcDate.getMonth() + 1;
  let srcDateD = srcDate.getDate();

  let ret = "";

  // 要额外显示的时间分钟
  let timeExtraStr = mustIncludeTime ? " " + formatDate(srcDate, "hh:mm") : "";

  // 当年
  if (currentYear == srcYear) {
    let currentTimestamp = currentDate.getTime();
    let srcTimestamp = timestamp;
    // 相差时间（单位：毫秒）
    let deltaTime = currentTimestamp - srcTimestamp;

    // 当天（月份和日期一致才是）
    if (currentMonth == srcMonth && currentDateD == srcDateD) {
      // 时间相差60秒以内
      if (deltaTime < 60 * 1000) ret = t("justNow");
      // 否则当天其它时间段的，直接显示“时:分”的形式
      else ret = formatDate(srcDate, "hh:mm");
    }
    // 当年 && 当天之外的时间（即昨天及以前的时间）
    else {
      ret = formatDate(srcDate, "M/d") + timeExtraStr;
    }
  }
  // 往年
  else {
    ret = formatDate(srcDate, "yyyy/M/d") + timeExtraStr;
  }

  return ret;
};

export const isSafari = () => {
  return navigator?.userAgent?.toLowerCase().indexOf("safari") > -1;
};

export const isiOS = () => {
  return /iPad|iPhone|iPod/.test(navigator?.userAgent);
};

// 是否微信浏览器
export const isWechat = () => {
  return navigator?.userAgent?.toLowerCase().indexOf("micromessenger") !== -1;
};

// 是否微信小程序
export const isWXProgram = uni.getSystemInfoSync().uniPlatform == "mp-weixin";

// 是否web环境
export const isWeb = uni.getSystemInfoSync().uniPlatform === "web";

type CallbackFunction = (...args: any[]) => void;

export function throttle(
  func: CallbackFunction,
  limit: number
): CallbackFunction {
  let inThrottle: boolean;
  let lastTime: number = 0;
  let timeoutId: any = null;

  return function (this: any, ...args: any[]) {
    const context = this;
    const currentTime = Date.now();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!inThrottle || currentTime - lastTime >= limit) {
      func.apply(context, args);
      lastTime = currentTime;
      inThrottle = true;
    } else {
      timeoutId = setTimeout(() => {
        func.apply(context, args);
        lastTime = Date.now();
      }, limit);
    }
  };
}

export function deepClone<T>(value: T): T {
  // 处理基础类型（null, undefined, number, string, boolean, symbol）
  if (value === null || typeof value !== "object") {
    return value;
  }

  // 处理日期
  if (value instanceof Date) {
    return new Date(value.getTime()) as any;
  }

  // 处理数组
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as any;
  }

  // 处理 Map
  if (value instanceof Map) {
    const clonedMap = new Map();
    value.forEach((v, k) => {
      clonedMap.set(deepClone(k), deepClone(v));
    });
    return clonedMap as any;
  }

  // 处理 Set
  if (value instanceof Set) {
    const clonedSet = new Set();
    value.forEach((v) => {
      clonedSet.add(deepClone(v));
    });
    return clonedSet as any;
  }

  // 处理对象（包括普通对象）
  if (value instanceof Object) {
    const clonedObj: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        clonedObj[key] = deepClone((value as any)[key]);
      }
    }
    return clonedObj;
  }

  // 未知类型，直接返回
  return value;
}
export function sortByPinned(a: any, b: any) {
  if (a.isPinned && !b.isPinned) {
    return -1; // a排在b前面
  } else if (!a.isPinned && b.isPinned) {
    return 1; // b排在a前面
  } else if ((!a.isPinned && !b.isPinned) || (a.isPinned && b.isPinned)) {
    if (!a.lastMessage?.time) {
      return 0;
    }
    return a.lastMessage?.time > b.lastMessage?.time ? -1 : 1; // 保持原有顺序
  } else {
    return 0; // 保持原有顺序
  }
}

// 格式化文本消息， 将输入框文本消息中的表情符号转换为对应的emoji,进行发送
export function formatTextMessage(txt: string): string {
  if (txt === undefined) {
    return "";
  }
  let rnTxt = "";
  let match = null;
  const regex = /(\[.*?\])/g;
  let start = 0;
  let index = 0;
  while ((match = regex.exec(txt))) {
    index = match.index;
    if (index > start) {
      rnTxt += txt.substring(start, index);
    }
    if (match[1] in emojiAltMap) {
      //@ts-ignore
      rnTxt += emojiAltMap[match[1]];
    } else {
      rnTxt += match[1];
    }
    start = index + match[1].length;
  }
  rnTxt += txt.substring(start, txt.length);
  return rnTxt;
}

export const renderTxt = (txt: string | undefined | null) => {
  if (txt === undefined || txt === null) {
    return [];
  }
  let rnTxt: any[] = [];
  let match;
  const regex =
    /(U\+1F600|U\+1F604|U\+1F609|U\+1F62E|U\+1F92A|U\+1F60E|U\+1F971|U\+1F974|U\+263A|U\+1F641|U\+1F62D|U\+1F610|U\+1F607|U\+1F62C|U\+1F913|U\+1F633|U\+1F973|U\+1F620|U\+1F644|U\+1F910|U\+1F97A|U\+1F928|U\+1F62B|U\+1F637|U\+1F912|U\+1F631|U\+1F618|U\+1F60D|U\+1F922|U\+1F47F|U\+1F92C|U\+1F621|U\+1F44D|U\+1F44E|U\+1F44F|U\+1F64C|U\+1F91D|U\+1F64F|U\+2764|U\+1F494|U\+1F495|U\+1F4A9|U\+1F48B|U\+2600|U\+1F31C|U\+1F308|U\+2B50|U\+1F31F|U\+1F389|U\+1F490|U\+1F382|U\+1F381|😀|😄|😉|😮|🤪|😎|🥱|🥴|☺|🙁|😭|😐|😇|😬|🤓|😳|🥳|😠|🙄|🤐|🥺|🤨|😫|😷|🤒|😱|😘|😍|🤢|👿|🤬|😡|👍|👎|👏|🙌|🤝|🙏|❤️|💔|💕|💩|💋|☀️|🌜|🌈|⭐|🌟|🎉|💐|🎂|🎁)/g;
  let start = 0;
  let index = 0;
  while ((match = regex.exec(txt))) {
    index = match.index;
    if (index > start) {
      rnTxt.push({
        type: "text",
        value: txt.substring(start, index)
      });
    }
    if (match[1] in emoji.map) {
      const v = emoji.map[match[1] as keyof typeof emoji.map];
      rnTxt.push({
        type: "emoji",
        value: v.url,
        alt: v.alt
      });
    } else {
      rnTxt.push({
        type: "text",
        value: match[1]
      });
    }
    start = index + match[1].length;
  }

  rnTxt.push({
    type: "text",
    value: txt.substring(start, txt.length)
  });
  return rnTxt;
};

export function splitArrayIntoChunks(arr: Array<any>, chunkSize: number) {
  const result: Array<any> = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

export const formatMessage = (message: MixedMessageBody) => {
  let lastMsg = "";
  switch (message?.type) {
    case "txt":
      if (message?.msg == "the combine message") {
        lastMsg = `[${t("chatHistory")}]`;
      } else {
        lastMsg = message?.msg;
      }
      break;
    case "img":
      lastMsg = `[${t("image")}]`;
      break;
    case "audio":
      lastMsg = `[${t("audio")}]`;
      break;
    case "file":
      lastMsg = `[${t("file")}]`;
      break;
    case "video":
      lastMsg = `[${t("video")}]`;
      break;
    case "custom":
      if (message.customEvent == "userCard") {
        lastMsg = `[${t("contact")}]`;
      } else {
        lastMsg = `[${t("custom")}]`;
      }
      break;
    case "combine":
      lastMsg = `[${t("chatHistory")}]`;
      break;
    default:
      console.warn("unexpected message type:", message?.type);
      break;
  }
  return lastMsg;
};

export function checkCharacter(character: string) {
  const pattern = /[\u4E00-\u9FA5]/; // 中文字符的unicode范围
  const isChinese = pattern.test(character);
  const isLetter = /^[a-zA-Z]$/.test(character);

  if (isChinese) {
    return "zh";
  } else if (isLetter) {
    return "en";
  } else {
    return "unknown";
  }
}

export function groupByName(name: string) {
  let initial = "#";
  if (checkCharacter(name.substring(0, 1)) == "en") {
    initial = name.substring(0, 1).toUpperCase();
  } else if (checkCharacter(name.substring(0, 1)) == "zh") {
    initial = pinyin(name.substring(0, 1), {
      toneType: "none"
    })[0][0].toUpperCase();
  } else {
    initial = "#";
  }
  return initial;
}
