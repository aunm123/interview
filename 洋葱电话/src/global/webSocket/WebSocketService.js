import {MessageDom} from "./MessageDom";
import ResolveMessage from './ResolveMessage'
import AutoSave from "../../TModal/AutoSave";
import Global from "../../mobx/Global";
import {TimerTodoList, TodoAction} from "../TimerTodoList";
import CustomStorage from "../CustomStorage";
import MessageService from "../../service/MessageService";
import HistoryDao from "../../dao/HistoryDao";
import NotificationService from "../NotificationService";
import {strings} from "../../../locales";
import {DeviceEventEmitter} from "react-native";

export class WebSocketService {

	@AutoSave
	global: Global;
	@AutoSave
	timerTodoList: TimerTodoList;
	@AutoSave
	messageService: MessageService;

	initWebSocketService() {
		this.timeout = 10; // 心跳时间10s
		this.needReConnect = true;
		this.connect = false;
		this.reconnect();
	}

	websocket: WebSocket;
	wsString = '';

	timeoutObj: any;
	serverTimeoutObj: any;

	messageDom: MessageDom;

	onMessage;
	onOrderFinish;

	heardCloseTimer;

	maxReConnect = 5;

	openWebSocket(ws) {
		// ws = "ws://localhost:8085";
		console.log(ws);
		if (this.connect) {
			return;
		}
		if (this.websocket) {
			this.websocket.close();
			this.websocket = null;
		}
		if (this.timeout) {
			clearTimeout(this.timeoutObj);
			this.timeoutObj = null;
		}
		if (this.serverTimeoutObj) {
			clearTimeout(this.serverTimeoutObj);
			this.serverTimeoutObj = null;
		}
		if (this.heardCloseTimer) {
			clearTimeout(this.heardCloseTimer);
			this.heardCloseTimer = null;
		}

		this.wsString = ws;
		this.websocket = new WebSocket(ws);
		this.messageDom = new MessageDom(ws, this.websocket);

		// 接收到消息的回调方法
		this.websocket.onmessage = event => {
			console.log('onmessage', event.data);
			const msList = ResolveMessage.resolve(event.data);
			if (this.onMessage) {
				this.onMessage(msList);
			}
		};

		// 连接发生错误的回调方法
		this.websocket.onerror = (error) => {
			console.log('出现错误');
			this.connect = false;
		};

		// 连接成功建立的回调方法
		this.websocket.onopen = () => {
			console.log('连接成功');
			this.connect = true;
			this.needReConnect = true;
			this.messageDom.load();
			this.heartCheck();
			this.maxReConnect = 5;
		};

		this.websocket.onclose = (e) => {
			console.log('websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean);
			this.connect = false;
			this.websocket = null;
			this.reconnect();
		};

		ResolveMessage.onServuceError = () => {
			// 从新发送一次load
		};
		// 获得心跳事件
		ResolveMessage.onHeardMessage = () => {
			// 获得心跳取消定时关闭的定时器
			// console.log('收到心跳', this.heardCloseTimer);
			if (this.heardCloseTimer) {
				clearTimeout(this.heardCloseTimer);
				this.heardCloseTimer = null;
			}
		};
		ResolveMessage.onNeedCloseWs = (orderData) => {
			console.log('need close ws');
			if (this.onOrderFinish) {
				this.onOrderFinish(orderData);
			}
			this.closeWebSocket();
		};
		ResolveMessage.onLoadMessage = async (datas) => {
			console.log(datas)
			// 获得 load 信息
			for (let item of datas) {
				let history = new HistoryDao();
				history.content = JSON.stringify(item);
				history.tophone = 'me';
				history.time = 0;
				history.type = -1;
				history.fromphone = 'service';
				history.isread = 0;
				history.state = 2;
				history.index = item.id;
				if (item.status == 1) {
					await this.messageService.insertMessage(history);
					if (NotificationService.onCustomMessageCome.length > 0) {
						NotificationService.onCustomMessageCome.forEach((item) => {
							item(history);
						})
					}
				} else if (item.status == 0) {
					await this.messageService.deleteMessageWithIndex(item.id);
				}
			}
		};
		ResolveMessage.onGetMessage = async (datas) => {
			console.log(datas);
			let contry_no = datas.contry_no;
			let phone_no = datas.phone_no;
			let history = new HistoryDao();
			history.content = datas.content;
			history.tophone = 'me';
			history.time = 0;
			history.type = 0;
			history.fromphone = '+' + contry_no + ' ' + phone_no;
			history.isread = 0;
			history.state = 2;
			history.index = datas.msg_id;
			await this.messageService.insertMessage(history);
			if (NotificationService.onCustomMessageCome.length > 0) {
				NotificationService.onCustomMessageCome.forEach((item) => {
					item(history);
				})
			}
		};
		ResolveMessage.onMoneyChange = (datas) => {
			// 收到余额变动消息
			this.global.userData.balance = datas.coin;
		};
		ResolveMessage.onLineMessage = () => {
			// 收到在线消息
		};
		ResolveMessage.onVerifyCaller = async (datas) => {
			// 自定义来电显示推送
			DeviceEventEmitter.emit('verifyCaller', datas);
		}


	}

	closeWebSocket(message = strings("error.websocket_has_close"), needReConnect = false) {
		if (this.connect) {
			try {
				this.messageDom.quit();
				// this.websocket.close();
			} catch (e) {
				console.log(e);
			}
			this.connect = false;
			this.websocket = null;
			this.needReConnect = needReConnect;
			this.messageDom.wsHasClose(message);
		}
	}

	heartCheck() {
		this.timerTodoList.removeTodoAction('wsheard');
		let action = new TodoAction('wsheard', () => {
			if (this.connect) {
				this.messageDom.hearBeat();
				// 创建定时关闭WS
				if (!this.heardCloseTimer) {
					this.heardCloseTimer = setTimeout(() => {
						this.closeWebSocket(strings("error.websocket_net_error"), true);
					}, this.timeout * 1000 + 5000);
				}
			} else {
				this.timerTodoList.removeTodoAction('wsheard');
			}
		}, this.timeout);
		this.timerTodoList.addTodoAction(action);

	}

	reconnect() {
		if (this.global.hasLogin) {
			if (this.maxReConnect > 0) {
				this.maxReConnect--;
				console.log('添加 reconnect 定时器');
				let action = new TodoAction('reconnect', () => {
					if (this.connect || !this.wsString || !this.needReConnect) {
						return;
					}
					console.log('尝试重连');
					this.openWebSocket(this.wsString);
				}, 6);
				this.timerTodoList.addTodoAction(action);
			}
		} else {
			// 没有登录 不重连
		}


	}

	sendMessage(message) {
		this.messageDom.sendMessageD(message);
	}

	sendTpl(type) {
		this.messageDom.payMethod(type);
	}

	destroy() {
		this.timerTodoList.removeTodoAction('wsheard');
		this.timerTodoList.removeTodoAction('reconnect');
	}


}
