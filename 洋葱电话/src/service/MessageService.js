import DBFunction from "../global/DBFunction";
import Util from "../global/Util";
import moment from "moment";
import AutoSave from "../TModal/AutoSave";
import HistoryDao from "../dao/HistoryDao";
import AppStore from "../mobx/AppStore";
import PhoneService from "./PhoneService";
import Global from "../mobx/Global";
import RecentService from "./RecentService";

class MessageService {

	@AutoSave
	appStore: AppStore;
	@AutoSave
	global: Global;
	@AutoSave
	phoneService: PhoneService;
	@AutoSave
	recentService: RecentService;

	/**
	 * 插入新信息记录
	 * @param {} history
	 */
	async insertMessage(history: HistoryDao) {
		let time = moment(new Date()).utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
		let {insertId} = await DBFunction.execute('INSERT INTO ' +
			'`history` ( `date`, `state`, `content`, `tophone`, `fromphone`, `time`, `type`, `isread`, `userid`, `index`) ' +
			'VALUES ( ? , ? , ? , ? , ? , ?, ?, ?, ?, ?);',
			[time, history.state, history.content, history.tophone,
				history.fromphone, history.time, history.type, history.isread, history.userid, history.index
			]);
		history.id = insertId;
		await this.recentService.setFirstRowHistory(history);
		await this.appStore.updateMessage();
		return {insertId};
	}

	/**
	 * 利用phone来删除信息
	 * @param {*} phone
	 */
	async deleteMessageWithPhone(phone) {
		await DBFunction.execute('DELETE FROM `history` WHERE `tophone` = ? OR `fromphone` = ? AND `userid` = ?;',
			[phone, phone, this.global.userid]);
		// 更新最近电话
		await this.appStore.updateMessage();
	}

	/**
	 * 利用index来删除信息
	 * @param {*} index
	 */
	async deleteMessageWithIndex(index) {
		await DBFunction.execute('DELETE FROM `history` WHERE `index` = ? AND `userid` = ?;',
			[index, this.global.userid]);
		// 更新最近电话
		await this.appStore.updateMessage();
	}

	/**
	 * 更新信息状态
	 * @param {*} params
	 */
	async UpdateMessageState(params) {
		let {state, id} = params;
		await DBFunction.execute('UPDATE `history` SET `state` = ? WHERE id = ? AND `userid` = ? ;',
			[state, id, this.global.userid]);
		await this.appStore.updateMessage();
	}

	/**
	 * 删除信息通过ID
	 * @param {*} id
	 */
	async DeleteMessageWithId(id) {
		await DBFunction.execute('DELETE FROM `history` WHERE `id` = ? AND `userid` = ? ',
			[id, this.global.userid]);
		await this.appStore.updateMessage();
	}

	/**
	 * 更新信息
	 * @param {} params
	 */
	async UpdateMessageStateWithContent(params) {
		let {state, content, id} = params;
		await DBFunction.execute('UPDATE `history` SET `state` = ?, `content` = ? WHERE id = ? AND `userid` = ?;',
			[state, content, id, this.global.userid]);
		await this.appStore.updateMessage();
	}

	/**
	 * 获得所有信息历史记录
	 * @param {*} name
	 * @param {*} maxLength
	 */
	async getAllMessageHistoryWithContractName(name, maxLength) {
		// maxLength = Number.MAX_SAFE_INTEGER;
		let result = {};
		let result_count = 0;
		let contract = await this.appStore.findAllContentWithName(name);
		for (let phone of contract.phones) {
			let phoneNo = '+' + phone.country_no + ' ' + phone.phone_no;
			let res = await DBFunction.execute('SELECT * FROM (SELECT * FROM `history` WHERE `fromphone` = ? OR `tophone` = ? AND `userid` = ? ORDER BY `date` DESC LIMIT 0, ? ) ORDER BY `date` ASC',
				[phoneNo, phoneNo, this.global.userid, maxLength]);
			result_count = res.length;
			for (let item of res) {
				let date_time = moment(item.date).format('YYYY-MM-DD');
				if (result.hasOwnProperty(date_time)) {
					result[date_time].push(item);
				} else {
					result[date_time] = [item];
				}
			}
		}
		// sqlite 排序不可靠 js再排序一次
		let sort_result = {};
		Object.keys(result).map((key) => {
			let need_sort_array = result[key];
			need_sort_array = need_sort_array.sort((item1, item2) => {
				let data1 = moment(item1.date);
				let date2 = moment(item2.date);
				if (data1.isSame(date2)) {
					return 0
				}
				if (data1.isBefore(date2)) {
					return -1;
				} else {
					return 1;
				}
			});
			sort_result[key] = need_sort_array
		});
		return {result: sort_result, count: result_count};
	}

	async getAllMessageHistoryByContractNameAndDate(name, startDateStr, endDateStr) {
		let result = {};
		let result_count = 0;
		let contract = await this.appStore.findAllContentWithName(name);

		for (let phone of contract.phones) {
			let phoneNo = '+' + phone.country_no + ' ' + phone.phone_no;

			let res = await DBFunction.execute(
				"SELECT * FROM `history` \n" +
				"WHERE `fromphone` = ? \n" +
				"OR `tophone` = ? \n" +
				"AND `state` = 2 \n" +
				"AND `date` BETWEEN ? AND ? \n" +
				"AND `userid` = ? \n" +
				"ORDER BY `date` ASC",
				[phoneNo, phoneNo, startDateStr, endDateStr, this.global.userid]);

			result_count = res.length;
			for (let item of res) {
				let date_time = moment(item.date).format('YYYY-MM-DD');
				if (result.hasOwnProperty(date_time)) {
					result[date_time].push(item);
				} else {
					result[date_time] = [item];
				}
			}
		}
		// sqlite 排序不可靠 js再排序一次
		let sort_result = {};
		Object.keys(result).map((key) => {
			let need_sort_array = result[key];
			need_sort_array = need_sort_array.sort((item1, item2) => {
				let data1 = moment(item1.date);
				let date2 = moment(item2.date);
				if (data1.isSame(date2)) {
					return 0
				}
				if (data1.isBefore(date2)) {
					return -1;
				} else {
					return 1;
				}
			});
			sort_result[key] = need_sort_array
		});
		return {result: sort_result, count: result_count};
	}

	/**
	 * 获得信息历史
	 */
	async getMessageHistory() {
		let rsu = [];
		let phoneSet = {};
		let phone_number = 'me';
		// let res = await DBFunction.execute('SELECT * FROM history WHERE (`tophone` = ? OR `fromphone` = ? ) ' +
		// 	'GROUP BY `tophone`, `fromphone` ORDER BY `date` DESC', [phone_number, phone_number]);

		let res = await DBFunction.execute('SELECT * FROM history WHERE `userid` = ?  ORDER BY `date` DESC', [this.global.userid]);
		for (let item of res) {
			let targetPhone = {};
			let phoneNum = '';
			let key = '';
			if (item.fromphone == phone_number) {
				// 本机打出去的信息
				targetPhone = Util.fixNumber(item.tophone);
				phoneNum = item.tophone;
				key = item.fromphone + item.tophone;
			} else {
				// 别人打进来的信息
				targetPhone = Util.fixNumber(item.fromphone);
				phoneNum = item.fromphone;
				key = item.tophone + item.fromphone;
			}
			await this.appStore.updateUnknowPhone();
			let contract = this.appStore.finListAllContent2(targetPhone, false);
			let value = {...contract, ...item, targetPhone: phoneNum};
			let oldValue = phoneSet[key];
			if (oldValue) {
				let oldvalue_time = moment(oldValue.date);
				let newvalue_time = moment(item.date);
				let t = newvalue_time.diff(moment(oldvalue_time), 'seconds');
				if (t > 0) {
					phoneSet[key] = value;
				}
			} else {
				phoneSet[key] = value;
			}
		}
		// 打进来和打出去的号码统一 用一个表示
		let keys = Object.keys(phoneSet);
		for (let key of keys) {
			rsu.push(phoneSet[key]);
		}

		await this.setRedPointNum();
		rsu = await this.recentService.updateLastRecentList(rsu);
		return rsu;
	}

	/**
	 * 通过id 查找message信息
	 * @param messageid
	 * @returns {Promise<null|*>}
	 */
	async getMessageHistoryById(messageid) {
		let res = await DBFunction.execute('SELECT * FROM `history` WHERE `id` = ? AND `userid` = ? ', [messageid, this.global.userid]);
		if (res.length > 0) {
			return res[0];
		} else {
			return null;
		}
	}

	/**
	 * 设置所有信息都为已读
	 * fromphone
	 */
	async setAllMessageToRead(contract) {
		for (let phone of contract.phones) {
			let p = "+" + phone.country_no + ' ' + phone.phone_no;
			console.log(p + "已读");
			await this.setAllMessageToReadFromePhone(p);
		}
		await this.appStore.updateMessage();
	}

	async setRedPointNum() {
		let res = await DBFunction.execute('SELECT COUNT(id) as count FROM `history` WHERE `isread`= ? AND `userid`=?',
			[0, this.global.userid]);
		if (res.length > 0) {
			this.appStore.currentRedPoint = res[0].count;
		}
	}

	/**
	 * 获得所有活动
	 * @returns {Promise<void>}
	 */
	async getAllActionMessage() {
		let res = await DBFunction.execute('SELECT * FROM `history` WHERE `fromphone` = ? AND `userid` = ?',
			['service', this.global.userid]);

		let result = [];
		for (let item of res) {
			let date_time = moment(item.date).format('YYYY-MM-DD');
			if (result.hasOwnProperty(date_time)) {
				result[date_time].push(JSON.parse(item.content));
			} else {
				result[date_time] = [JSON.parse(item.content)];
			}
		}
		return result;
	}

	/**
	 * 设置所有活动已读
	 * @returns {Promise<void>}
	 */
	async setAllActionMessageRead() {
		await this.setAllMessageToReadFromePhone('service');
		await this.appStore.updateMessage();
	}

	/**
	 * 设置所有 fromphone 已读
	 * @returns {Promise<void>}
	 */
	async setAllMessageToReadFromePhone(fromphone) {
		await DBFunction.execute('UPDATE `history` SET `isread` = 1 WHERE `fromphone` = ? AND `userid` = ? ;', [fromphone, this.global.userid]);
	}

	/**
	 * 删除所有聊天记录
	 * @param {*} id
	 */
	async deleteAllMessage() {
		await DBFunction.execute('DELETE FROM `history` WHERE `userid` = ? AND `fromphone` != ? ',
			[this.global.userid, 'service']);
		await this.appStore.updateMessage();
	}

	/**
	 * 获得所有活动消息的ID
	 * @returns {Promise<void>}
	 */
	async getAllActionMessageIds() {
		let res = await DBFunction.execute('SELECT * FROM `history` WHERE `fromphone` = ? AND `userid` = ?',
			['service', this.global.userid]);
		let result = [];
		for (let item of res) {
			result.push(item.index);
		}
		console.log(result, result.join(','), "129307109273717287309810298308109283091802380918209830918238012830");
		return result;
	}
}

export default MessageService;
