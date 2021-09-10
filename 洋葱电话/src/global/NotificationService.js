'use strict';
import {Alert, NativeEventEmitter, NativeModules, Vibration} from "react-native";
import JPush from 'jpush-react-native';
import MessageService from "../service/MessageService";
import AppStore from "../mobx/AppStore";
import Global from "../mobx/Global";
import HistoryDao from "../dao/HistoryDao";
import AutoSave from "../TModal/AutoSave";
import Sound from "react-native-sound";

class NotificationService {

	onCustomMessageCome = [];

	@AutoSave
	appStore: AppStore;
	@AutoSave
	global: Global;
	@AutoSave
	messageService: MessageService;

	initJPUSH() {

		JPush.init();

		//连接状态
		this.connectListener = result => {
			console.log("connectListener:" + JSON.stringify(result))
		};
		JPush.addConnectEventListener(this.connectListener);
		//通知回调
		this.notificationListener = result => {
			console.log("notificationListener:" + JSON.stringify(result))
		};
		JPush.addNotificationListener(this.notificationListener);
		//自定义消息回调
		this.customMessageListener = async result => {
			console.log(result);

			this.playSoundAndShock();
			// result = JSON.stringify(result);
			let type = result.extras.type;
			switch (type) {
				case 1: {
					let fromPhone = '+' + result.extras.contry_no + ' ' + result.extras.phone_no;
					let data = {
						state: 2,
						content: result.content,
						tophone: 'me',
						fromphone: fromPhone,
						time: 0,
						type: 0,
						isread: 0
					};
					let history: HistoryDao = new HistoryDao(data);
					await this.messageService.insertMessage(history);
					if (this.onCustomMessageCome.length > 0) {
						this.onCustomMessageCome.forEach((item)=>{
							item(data);
						})
					}
				}
				case 2: {
					if (this.onCustomMessageCome.length > 0) {
						this.onCustomMessageCome.forEach((item)=>{
							item();
						})
					}
				}
			}

			setTimeout(()=>{
				this.stopMusicAndShock();
			}, 1000);

			console.log("customMessageListener:" + JSON.stringify(result))
		};
		JPush.addCustomMessagegListener(this.customMessageListener);
		//本地通知回调 todo
		this.localNotificationListener = result => {
			console.log("localNotificationListener:" + JSON.stringify(result))
		};
		JPush.addLocalNotificationListener(this.localNotificationListener);
		//tag alias事件回调
		this.tagAliasListener = result => {
			console.log("tagAliasListener:" + JSON.stringify(result))
		};
		JPush.addTagAliasListener(this.tagAliasListener);
		//手机号码事件回调
		this.mobileNumberListener = result => {
			console.log("mobileNumberListener:" + JSON.stringify(result))
		};
		JPush.addMobileNumberListener(this.mobileNumberListener);

		JPush.setBadge({"badge": 0});

		JPush.clearAllNotifications(null);
	}

	addCustomMessageListen(callback) {
		let index = this.onCustomMessageCome.push(callback);
		return index - 1;
	}

	removeCustomMessageListen(index) {
		try {
			this.onCustomMessageCome.splice(index, 1);
		}catch (e) {}
	}

	currentMusic: Sound = null;

	playSoundAndShock() {

		if (this.currentMusic){
			this.stopMusicAndShock();
		}

		if(this.global.messageNotice_Voice){
			if (this.global.Shake) {
				// 震动
				let pattern = [0,100];
				// if (Platform.OS === 'android') {
				// 	pattern = [0,100];
				// } else {
				// 	pattern = [0];
				// }
				Vibration.vibrate(pattern, true);
			}

			if (this.global.Voice) {
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

export default new NotificationService();
