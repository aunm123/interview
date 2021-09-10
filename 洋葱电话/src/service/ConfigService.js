'use strict';
import AutoSave from "../TModal/AutoSave";
import AppStore from "../mobx/AppStore";
import Global from "../mobx/Global";
import DBFunction from "../global/DBFunction";
import {toJS} from "mobx";
import Req from "../global/req";
import URLS from "../value/URLS";

class ConfigService {

	@AutoSave
	global: Global;
	@AutoSave
	appstore: AppStore;

	genertKey(contract) {
		let key = "";
		switch (contract.contractType) {
			case 0: {
				// 网络通讯录
				key = contract.name + "_" + contract.id;
				break;
			}
			case 1: {
				// 通讯录
				key = contract.name + "_" + contract.id;
				break;
			}
			case 2: {
				// 未知号码
				key = contract.name;
				break;
			}
		}
		return key;
	}

	async generContractByPhone(country_no, phone_no) {
		let contract = null;
		if (phone_no.length > 0) {
			contract = this.appstore.finListAllContent2({country_no, phone_no}, false);

			if (contract.name && contract.contractType != 2) {
				contract = await this.appstore.findAllContentWithName(contract.name);
			} else {
				contract = {
					name: '+' + country_no + ' ' + phone_no,
					contractType: 2,
					phones: [
						{label: '', number: '', type: 0, country_no: country_no, phone_no: phone_no}
					]
				};
				await this.appstore.addUnknowPhone(contract);
			}
		}
		return contract;
	}

	async getConfigByContract(contract) {
		let key = this.genertKey(contract);
		// 默认全部不禁止
		let temp = {id: null, key: key, bell: 1, ban: 0};
		let res = await DBFunction.execute('SELECT * FROM `config` WHERE `key` = ? AND `userid` = ? ;', [key, this.global.userid]);
		if (res.length > 0) {
			temp = res[0];
		}
		return temp;
	}

	async getConfigByPhone({country_no, phone_no}) {
		let contract = await this.generContractByPhone(country_no, phone_no);
		return await this.getConfigByContract(contract);
	}

	async insertOrSaveConfig(contract, bell = null, ban = null) {

		// 先发送请求
		let blackListContent = [];
		for (let {country_no, phone_no} of contract.phones) {
			blackListContent.push({country_no: country_no, phone_no: phone_no})
		}

		if (ban == 1) {
			// 添加黑名单
			await Req.post(URLS.ADD_BLACK_LIST, {
				content: blackListContent
			});
			// 移除白名单
			await Req.post(URLS.REMOVE_WHITE_LIST, {
				content: blackListContent
			});
		} else if (ban == 0) {
			// 移除黑名单
			await Req.post(URLS.REMOVE_BLACK_LIST, {
				content: blackListContent
			});
		}

		// 请求成功后再修改本地文件

		let key = this.genertKey(contract);
		let res = await DBFunction.execute('SELECT COUNT(id) as count FROM `config` WHERE `key`= ? AND `userid`=?', [key, this.global.userid]);
		let count = res[0].count;

		if (count > 0 ){
			// 需要更新
			let sqls = [];
			let params = [];
			if (bell != null) {
				sqls.push("`bell` = ? ");
				params.push(bell.toString());
			}
			if (ban != null) {
				sqls.push("`ban` = ? ");
				params.push(ban.toString());
			}

			let sqlStr = sqls.join(",");
			sqlStr = 'UPDATE `config` SET ' + sqlStr + ' WHERE `key` = ? AND `userid` = ? ;';
			if (params.length > 0) {
				await DBFunction.execute(sqlStr, [ ...params, key, this.global.userid])
			}
		} else {
			// 需要插入
			let sqls = [' `key`, `userid`'];
			let sqlValue = [' ?', ' ?'];
			let params = [];
			if (bell != null) {
				sqls.push(" `bell`");
				sqlValue.push(" ?");
				params.push(bell.toString());
			} else {
				// 响铃默认为1
				sqls.push(" `bell`");
				sqlValue.push(" ?");
				params.push("1");
			}
			if (ban != null) {
				sqls.push(" `ban`");
				sqlValue.push(" ?");
				params.push(ban.toString());
			}

			let sqlStr = sqls.join(",");
			let sqlValueStr = sqlValue.join(",");
			sqlStr = 'INSERT INTO `config` (' + sqlStr + ') VALUES ('+ sqlValueStr +' )';
			if (params.length > 0) {
				await DBFunction.execute(sqlStr, [ key, this.global.userid, ...params])
			}
		}

	}

	async insertOrSaveConfigByPhone(country_no, phone_no, bell = null, ban = null) {
		let contract = await this.generContractByPhone(country_no, phone_no);
		await this.insertOrSaveConfig(contract, bell, ban);
	}

	async updateKey(oldContract, newContract) {

		let bell = 1;
		let ban = 0;

		let oldKey = this.genertKey(oldContract);

		let res = await DBFunction.execute('SELECT * FROM `config` WHERE `key` = ? AND `userid` = ?;', [oldKey, this.global.userid]);
		if (res.length > 0) {
			let temp = res[0];
			bell = bell && temp.bell;
			ban = ban || temp.ban;
		}

		// 删除旧的数据
		await DBFunction.execute('DELETE FROM `config` WHERE `key` = ? AND `userid` = ?;', [oldKey, this.global.userid]);

		for (let phone of newContract.phones) {
			let phoneKey = "+" + phone.country_no + " " + phone.phone_no;

			res = await DBFunction.execute('SELECT * FROM `config` WHERE `key` = ? AND `userid` = ?;', [phoneKey, this.global.userid]);
			if (res.length > 0) {
				let temp = res[0];
				bell = bell && temp.bell;
				ban = ban || temp.ban;
			}
			// 删除旧的数据
			await DBFunction.execute('DELETE FROM `config` WHERE `key` = ? AND `userid` = ?;', [phoneKey, this.global.userid]);
		}

		// 新增新数据
		await this.insertOrSaveConfig(newContract, bell, ban);
		await this.appstore.updateMessage();
	}

	async deleteContractSettingConfig(contract) {

		let bell = 0;
		let ban = 0;

		let key = this.genertKey(contract);

		let res = await DBFunction.execute('SELECT * FROM `config` WHERE `key` = ? AND `userid` = ?;', [key, this.global.userid]);
		if (res.length > 0) {
			let temp = res[0];
			bell = temp.bell;
			ban = temp.ban;
		}
		// 删除旧的数据
		await DBFunction.execute('DELETE FROM `config` WHERE `key` = ? AND `userid` = ?;', [key, this.global.userid]);

		for (let phone of contract.phones) {
			let tempContract = {
				name: '+' + phone.country_no + ' ' + phone.phone_no,
				contractType: 2,
				phones: [
					{label: '', number: '', type: 0, country_no: phone.country_no, phone_no: phone.phone_no}
				]
			};

			// 删除旧的数据
			await DBFunction.execute('DELETE FROM `config` WHERE `key` = ? AND `userid` = ?;', [tempContract, this.global.userid]);
			// 新增新数据
			await this.insertOrSaveConfig(tempContract, bell, ban);
		}

		await this.appstore.updateMessage();

	}

}

export default ConfigService;
