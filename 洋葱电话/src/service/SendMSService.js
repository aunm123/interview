import DBFunction from "../global/DBFunction";
import AutoSave from "../TModal/AutoSave";
import AppStore from "../mobx/AppStore";
import CustomStorage from "../global/CustomStorage";
import {strings} from "../../locales";
import URLS from "../value/URLS";
import Req from "../global/req";
import Global from "../mobx/Global";

class SendMSService {

	@AutoSave
	global: Global;

	async sendSMS(url, params) {
		let lastsendmessage = await CustomStorage.getItem('lastsendmessage');
		if (lastsendmessage) {

			let lastDate = new Date(0);
			try {
				lastDate = new Date(parseFloat(lastsendmessage));
			} catch (e) {
			} finally {

				let currentDate = new Date();
				let total = parseInt((currentDate.getTime() - lastDate.getTime()) / 1000, 10);
				if (total >= 60) {
					let res = await this.postCode(url, params);
					return res;
				} else {
					this.global.presentMessage(strings('login.send_sms_to_fast') + ' ' + (60 - total) + 's');
					return null;
				}
			}

		} else {
			let res = await this.postCode(url, params);
			return res;
		}
	}

	async postCode(url, params) {
		try {
			let res = await Req.post(url, params);
			let currentDate = new Date().getTime().toString();
			await CustomStorage.setItem('lastsendmessage', currentDate);

			return res;
		}catch (e) {
			this.global.presentMessage(e.message);
			return null
		}
	}

}
export default SendMSService;
