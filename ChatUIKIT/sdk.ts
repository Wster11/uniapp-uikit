import websdk from "easemob-websdk/uniApp/Easemob-chat";

import type {
  EasemobChat as Chat,
  EasemobChatStatic as ChatSDKStatic
} from "easemob-websdk/Easemob-chat";

const chatSDK = websdk as ChatSDKStatic;

export type { Chat, ChatSDKStatic };

export { chatSDK };
