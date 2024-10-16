import { makeAutoObservable } from "mobx";
import type {
	EasemobChat,
	EasemobChatStatic
} from "easemob-websdk/Easemob-chat";
//@ts-ignore
import websdk from "easemob-websdk/uniApp/Easemob-chat";

websdk.logger.onLog = (log : any) => {
	console.log(log.time, ...log.logs);
};

// 关闭控制台日志
websdk.logger.setConsoleLogVisibility(false);

class ConnStore {
	/** IM连接实例 */
	conn : EasemobChat.Connection | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	/** 初始化webIM */
	initChatSDK(config : EasemobChat.ConnectionParameters) {
		this.setChatConn(new websdk.connection(config));
		return this.conn;
	}

	/** 设置conn实例 */
	setChatConn(connection : EasemobChat.Connection) {
		this.conn = connection;
		//@ts-ignore
		uni.conn = connection;
	}

	/** 获取conn实例 */
	getChatConn() : EasemobChat.Connection {
		if (this.conn) {
			return this.conn;
		}
		throw new Error("conn is not initialized");
	}

	/** 获取 websdk */
	getChatSDK() : EasemobChatStatic {
		if (websdk) {
			return websdk;
		}
		throw new Error("SDK is not found");
	}
}

export default ConnStore