'use strict';
import {Alert, NativeEventEmitter, NativeModules, Platform, Vibration} from "react-native";
import Util from "./Util";
import Req from "./req";
import URLS from "../value/URLS";
import JPush from "jpush-react-native";
import CustomStorage from "./CustomStorage";
import AutoSave from "../TModal/AutoSave";
import Sound from 'react-native-sound';
import uuid from "rn-fetch-blob/utils/uuid";
import {WebSocketService} from "./webSocket/WebSocketService";
import PhoneService from "../service/PhoneService";
import ContractService from "../service/ContractService";
import MessageService from "../service/MessageService";
import Global from "../mobx/Global";
import AppStore from "../mobx/AppStore";
import {toJS} from "mobx";
import ConfigService from "../service/ConfigService";

// Enable playback in silence mode
Sound.setCategory('Playback');

const CallKitCallModule = NativeModules.CallKitCallModule;

class CallService {

	@AutoSave
	appStore: AppStore;
	@AutoSave
	global: Global;
	@AutoSave
	messageService: MessageService;
	@AutoSave
	contractService: ContractService;
	@AutoSave
	phoneService: PhoneService;
	@AutoSave
	WebSocketService: WebSocketService;
	@AutoSave
	configService: ConfigService;

	uuid = "";
	from = "";
	currentCallid = '';

	startListen() {
		const CallKitCallModuleEmitter = new NativeEventEmitter(CallKitCallModule);

		this.EventCallReject = CallKitCallModuleEmitter.addListener('EventCallReject', (reminder) => {
			let call_sid = reminder.sid;
			if (call_sid.length > 0) {
				Req.post(URLS.HAND_UP_PHONE, {"CallSid": call_sid}, true);
			}
			if (this.global.currentPageName == 'CallingPage') {
				this.global.nav.pop();
			}
			this.stopMusicAndShock();
			this.from = '';
			this.uuid = '';
		});

		this.EventErrorMessage = CallKitCallModuleEmitter.addListener('EventErrorMessage',
			(reminder) => {
				this.global.presentMessage(reminder.error);
				this.stopMusicAndShock();
			});
		this.EventTokenGet = CallKitCallModuleEmitter.addListener('EventTokenGet',
			async (reminder) => {
				// await Req.post(URLS.SET_DATA, {...reminder.params})
			});

		this.EventCallComingOutApp = CallKitCallModuleEmitter.addListener('EventCallComingOutApp',
			(reminder) => {
				console.log("------------在APP外接听到来电--------");
				this.from = reminder.from;
				this.uuid = reminder.uuid;

				let {country_no, phone_no} = Util.fixNumber("+" + this.from);
				this.phoneService.insertCallHistory({
					toPhone: 'me',
					fromPhone: '+' + country_no + ' ' + phone_no,
					isread: false,
				})
					.then((r) => {
						this.currentCallid = r.insertId;
					})
				this.playSoundAndShock({country_no, phone_no});
			});

		this.EventCallComingInApp = CallKitCallModuleEmitter.addListener('EventCallComingInApp',
			(reminder) => {

				console.log("------------在APP内接听到来电--------");
				this.from = reminder.from;
				this.uuid = reminder.uuid;

				let {country_no, phone_no} = Util.fixNumber("+" + this.from);
				this.phoneService.insertCallHistory({
					toPhone: 'me',
					fromPhone: '+' + country_no + ' ' + phone_no,
					isread: false,
				})
					.then((r) => {
						this.currentCallid = r.insertId;
						this.global.nav.push('CallingPage', {
							to_country: country_no,
							to_no: phone_no,
							history_id: this.currentCallid,
							uuid: this.uuid,
						});
					})
				this.playSoundAndShock({country_no, phone_no});


			})

		this.EventCallComingStart = CallKitCallModuleEmitter.addListener('EventCallComingStart',
			(reminder) => {
				console.log("------------EventCallComingStart--------", reminder);
				if (this.uuid == reminder.uuid) {
					// to_country
					// to_no
					let {country_no, phone_no} = Util.fixNumber("+" + this.from);
					if (this.global.currentPageName != 'CallingPage') {
						this.global.nav.push('CallingPage', {
							to_country: country_no,
							to_no: phone_no,
							history_id: this.currentCallid
						})
					}
				}
			})

		this.EvemtEndCallAction = CallKitCallModuleEmitter.addListener('EvemtEndCallAction',
			(reminder) => {
				console.log("------------EvemtEndCallAction--------", reminder);
				this.stopMusicAndShock();
				if (this.global.currentPageName == 'CallingPage') {
					this.global.nav.pop();
				}
				this.from = '';
				this.uuid = '';
			})


	}



	stopListen() {
		try {
			this.EventCallComingOutApp.remove();
			this.EventCallComingStart.remove();
			this.EvemtEndCallAction.remove();
			this.EventTokenGet.remove();
			this.EventErrorMessage.remove();
			this.EventCallReject.remove();
			this.EventCallComingInApp.remove();
		} catch (e) {

		}
	}

	async initData() {
		// 初始化

		await this.global.initGlobalDate();
		let token = await CustomStorage.getItem('token');
		console.log("CustomStorage get token", token);
		if (token) {
			// 获取TOKEN
			await Req.post(URLS.TOKEN_CHECK);
			await this.global.updateUserData();
			// 获取电话列表
			let phonelist = await Req.post(URLS.MY_PHONE);
			this.global.userData.phonelist = phonelist.data;
			// 获取联系人
			let conData = await Req.post(URLS.GET_CONTACTS);
			await this.contractService.cleanContent();
			for (let item of conData.data) {
				await this.appStore.addContent(item);
			}
			await this.appStore.updateUnknowPhone();

		}
		let tempfocusContractListJSON = await CustomStorage.getItem('tempfocusContractList', "{}");
		console.log("CustomStorage init token finish", tempfocusContractListJSON);

		this.appStore.tempfocusContractList = JSON.parse(tempfocusContractListJSON);


		// 设置access token
		let params = {identity: this.global.userid, type: Platform.OS};
		let res = await Req.post(URLS.GET_ACCESSTOKEN, params);
		let accessToken = res.data.token;
		console.log(accessToken, "===================", CallKitCallModule);
		// CallModule.registeNotificition(accessToken);
		CallKitCallModule.registeNotificition(accessToken);

		console.log("CallKitCallModule registeNotificition");

		JPush.setAlias({alias: this.global.userid, sequence: 1});
		console.log("极光推送设置别名", this.global.userid);

		console.log(this.phoneService, this.messageService)
		// 数据库获得最近20个电话
		// 更新最近电话
		this.appStore.nearlyPhones = await this.phoneService.getPhoneHistory()
		this.appStore.lastMessageData = await this.messageService.getMessageHistory();

		console.log('获得最近通话成功');

		res = await Req.post(URLS.SEND_MESSAGE_PRICE, {});
		let data = {};
		for (let i of res.data) {
			data[i.country_no] = i;
		}
		this.global.smsPriceList = data;
		console.log('获得话费成功');

		// websocket设置
		this.WebSocketService.initWebSocketService();
		this.WebSocketService.openWebSocket(this.global.websocketUrl);
		// this.WebSocketService.openWebSocket('ws://localhost:8085/')
		console.log('WebSocketService 设置成功');
	}


	currentMusic: Sound = null;

	async playSoundAndShock({country_no, phone_no}) {

		if (this.currentMusic){
			this.stopMusicAndShock();
		}

		if(this.global.callingNotice_Voice){

			let targetSetting = await this.configService.getConfigByPhone({country_no, phone_no});
			console.log(toJS(targetSetting));

			let shake = this.global.Shake;
			let voice = this.global.Voice && targetSetting.bell;


			if (shake) {
				// 震动
				let pattern = [0,100];
				// if (Platform.OS === 'android') {
				// 	pattern = [0,100];
				// } else {
				// 	pattern = [0];
				// }
				Vibration.vibrate(pattern, true);
			}

			if (voice) {
				// 播放音乐
				let demoAudio = require('../assets/mp3/raing.mp3');
				this.currentMusic = new Sound(demoAudio, (error) => {
					if (error) {
						console.log('failed to load the sound', error);
						return;
					}
					this.currentMusic.setNumberOfLoops(-1);
					// Play the sound with an onEnd callback
					this.currentMusic.play((success) => {
						if (success) {
							console.log('successfully finished playing');
						} else {
							console.log('playback failed due to audio decoding errors');
						}
					});
				});
			}
		}

	}

	stopMusicAndShock() {
		Vibration.cancel();
		if (this.currentMusic) {
			this.currentMusic.stop();
			this.currentMusic.release();
			this.currentMusic = null;
		}

	}
}

export default CallService;
