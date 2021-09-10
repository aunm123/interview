import AutoSave from "../../TModal/AutoSave";
import Global from "../../mobx/Global";
import CustomStorage from "../CustomStorage";
import MessageService from "../../service/MessageService";

export class MessageDom {

	@AutoSave
	global: Global;
	@AutoSave
	messageService: MessageService;

	agentData;
	wsClose = true;
	closeMessage;

	ws: WebSocket;


	time() {
		return new Date().getTime().toString().substr(0, 10);
	}

	constructor(wsString: string,
				ws: WebSocket) {
		// ws://ws.xxxx.com:8899/xxx/xxx/xxxx/x
		// url/用户 ID/会话 ID/md5 签名/1
		this.ws = ws;
		this.wsClose = false;
	}

	async load() {

		let id_array = await this.messageService.getAllActionMessageIds();

		console.log('websocket 当前id是', id_array);

		const loadMessage = {
			cmd: 'load',
			userid: this.global.userid,
			id: id_array.join(','),
		};
		this.send(loadMessage);
	}

	payMethod(mid) {
		const tplMessage = {
			cmd: 'send',
			time: this.time(),
			data: {
				style: 'tplinfo',
				content: parseInt(mid),
				agentid: this.agentData.id,
				money: 100
			},
			type: 1,
			userid: this.global.userid,
		};
		this.send(tplMessage);
	}

	sendMessageD(mesage) {
		const sMessage = {
			cmd: 'send',
			time: this.time(),
			data: {
				style: 'string',
				content: mesage
			},
			type: 1,
			userid: this.global.userid,
		};
		this.send(sMessage);
	}

	hearBeat() {
		const hMesage = {
			cmd: "heartbeat",
			userid: this.global.userid,
		};
		this.send(hMesage);
	}

	send(message) {
		if (this.wsClose) {
			this.global.presentMessage(this.closeMessage);
		} else {
			const ab = this.str2ab(JSON.stringify(message));
			const str = this.ab2str(ab);
			this.ws.send(str);
		}
	}

	quit() {
		const quit = {
			cmd: 'quit',
			userid: this.global.userid,
		};
		if (!this.wsClose) {
			const ab = this.str2ab(JSON.stringify(quit));
			const str = this.ab2str(ab);
			this.ws.send(str);
		}
	}

	wsHasClose(message) {
		this.wsClose = true;
		this.closeMessage = message;
	}

	setAgentData(agentData: any) {
		this.agentData = agentData;
	}

	str2ab(str) {
		const buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
		const bufView = new Uint16Array(buf);
		for (let i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	ab2str(buf) {
		return String.fromCharCode.apply(null, new Uint16Array(buf));
	}

}


