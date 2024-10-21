import { t } from "../locales/index";
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

export const isWechat = () => {
  return navigator?.userAgent?.toLowerCase().indexOf("micromessenger") !== -1;
};

type CallbackFunction = (...args: any[]) => void;

export function throttle(
  func: CallbackFunction,
  limit: number
): CallbackFunction {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number | undefined;

  return function (this: any, ...args: any[]) {
    const context = this;

    if (!lastRan) {
      lastRan = Date.now();
      lastFunc = setTimeout(function () {
        func.apply(context, args);
        lastRan = undefined;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan! >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
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
