'use strict';
import AutoSave from "../TModal/AutoSave";
import AppStore from "../mobx/AppStore";
import Global from "../mobx/Global";
import Req from "../global/req";
import URLS from "../value/URLS";
import Util from "../global/Util";

class OtherService {

	@AutoSave
	global: Global;
	@AutoSave
	appstore: AppStore;

	timeNumber = 0;
	timeUp = null;

	startTimeUp() {
		this.timeNumber = 60;
		this.timeUp = setInterval(() => {
			this.timeNumber--;
			if (this.timeNumber <= 0 && this.timeUp) {
				clearInterval(this.timeUp);
				this.timeUp = null;
			}
		}, 1000)
	}

	async getCallComingVerifyCode(country_no, phone_no) {
		if (this.timeUp) {
			this.global.presentMessage("发送请求过于频繁，请稍后再试一下");
			throw "timeout";
		} else {
			let res = await Req.post(URLS.CREATE_CALLER, {country_no: country_no, phone_no: phone_no});
			this.startTimeUp();
			return res.data.verify_code;
		}
	}

	async getCallTransferVerifyCode(country_no, phone_no, phone) {

		let p = Util.fixNumber(phone);

		if (this.timeUp) {
			this.global.presentMessage("发送请求过于频繁，请稍后再试一下");
			throw "timeout";
		} else {
			let res = await Req.post(URLS.CALL_TRANSFER, {
				transfer_country: country_no,
				transfer_no: phone_no,
				phone_no: p.country_no + p.phone_no
			});
			this.startTimeUp();
			return res.data.verify_code;
		}
	}

	async callComingSwitch(numValue) {
		await Req.post(URLS.CALLSER_SWITCH, {status: numValue});
	}

	async callTransferSwitch(numValue, phone ) {
		let p = Util.fixNumber(phone);
		await Req.post(URLS.TRANSFER_SWITCH, {status: numValue, phone_no: p.country_no + p.phone_no});
	}

	async updateLocalContent(contenList) {
		if (this.global.hasLogin) {
			Req.post(URLS.MAIL_LIST, {content: contenList})
				.then();
		}
	}
}

export default OtherService;
