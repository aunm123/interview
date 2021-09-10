'use strict';
import {observable, action, computed, autorun, toJS} from 'mobx'
import pinyin from "pinyin";
import Contacts, {Contact} from "react-native-contacts";
import {PermissionsAndroid, Platform, Alert} from "react-native";
import Util from "../global/Util";
import md5 from "md5";
import AutoSave from "../TModal/AutoSave";
import PhoneService from "../service/PhoneService";
import MessageService from "../service/MessageService";
import ContractService from "../service/ContractService";
import DBACtion from "../global/DBAction";
import CustomStorage from "../global/CustomStorage";
import ConfigService from "../service/ConfigService";
import Req from "../global/req";
import URLS from "../value/URLS";
import RecentService from "../service/RecentService";
import OtherService from "../service/OtherService";


class AppStore {

	@AutoSave
	phoneService: PhoneService;
	@AutoSave
	messageService: MessageService;
	@AutoSave
	contractService: ContractService;
	@AutoSave
	configService: ConfigService;
	@AutoSave
	recentService: RecentService;
	@AutoSave
	otherService: OtherService;
	@AutoSave
	dbAction: DBACtion;

	// 在线通讯录
	@observable
	intelContent = [];
	// 本地通讯录
	@observable
	localContent = [];
	// 陌生号码通讯录
	@observable
	unknowContent = [];

	@observable
	currentRedPoint = 0;


	@observable
	needContactsPromisser = false;

	@observable
	nearlyPhones = [];     // 最近通话
	@observable
	lastMessageData = [];  // 最近短信
	@observable
	tempfocusContractList = {};


	// 初始化通讯录结构
	// {
	// 	name: '',
	// 	contractType: 0,
	// 	phones: [
	// 		{ label: 'mobile', number: '', type: 0, country_no : '855', phone_no: '123123123' }
	// 	]
	// }

	constructor() {

	}

	async logout() {
		this.unknowContent = [];
		this.intelContent = [];
		this.nearlyPhones = [];
		this.lastMessageData = [];
	}

	@computed get listAllContent() {
		let list = [...this.intelContent, ...this.localContent, ...this.unknowContent];
		return list
	}

	@computed get listAllContent2() {
		let list = [...this.intelContent, ...this.localContent];
		return list
	}

	@computed get focusContractList() {
		let list = [];
		this.listAllContent.map((item) => {
			Object.keys(this.tempfocusContractList).map((key) => {
				if (item.name == key) {
					list.push(item);
				}
			});
		});

		return list
	}

	@computed get messageFocusContractList() {
		let list = [];
		this.lastMessageData.map((item) => {
			Object.keys(this.tempfocusContractList).map((key) => {
				if (item.name == key) {
					list.push(item);
				}
			});
		});

		return list
	}

	findLocalWithkeywold(searchText) {
		let result = [];
		for (let item of this.localContent) {
			let name = item.name;
			for (let phone of item.phones) {
				let needAdd = false;
				let {country_no, phone_no} = phone;
				if (name.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (phone_no.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (country_no.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (needAdd) {
					result.push({name: name, country_no: country_no, phone_no: phone_no, contractType: 1})
				}
			}
		}
		return result;
	}

	findContentWithkeywold(searchText) {
		let result = [];
		for (let item of this.intelContent) {
			let name = item.name;
			for (let phone of item.phones) {
				let needAdd = false;
				let {country_no, phone_no} = phone;
				if (name.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (country_no.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (phone_no.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (needAdd) {
					result.push({name: name, country_no: country_no, phone_no: phone_no, id: item.id, contractType: 0})
				}
			}
		}
		return result;
	}

	findUnknowWithkeywold(searchText) {
		let result = [];
		for (let item of this.unknowContent) {
			let name = item.name;
			let {country_no, phone_no} = Util.fixNumber(name);
			let needAdd = false;
			if (name.indexOf(searchText) >= 0) {
				needAdd = true;
			}
			if (needAdd) {
				result.push({name: name, country_no: country_no, phone_no: phone_no, contractType: 2})
			}
		}
		return result;
	}

	findLocalWithPhone({country_no, phone_no}, onlyPhone = true) {
		let result = [];
		for (let item of this.localContent) {
			for (let phone of item.phones) {
				let needAdd = false;
				if (phone.country_no == country_no && phone.phone_no.indexOf(phone_no) >= 0) {
					needAdd = true;
				}
				if (needAdd) {
					let key = item.name;
					if (onlyPhone) {
						// let key = country_no + phone_no;
						result[key] = {
							name: item.name,
							country_no: phone.country_no,
							phone_no: phone.phone_no,
							contractType: 1
						};
					} else {
						// let key = country_no + phone_no;
						result[key] = item;
						break;
					}
				}
			}
		}
		return result;
	}

	findContentWithPhone({country_no, phone_no}, onlyPhone = true) {
		let result = [];
		for (let item of this.intelContent) {
			for (let phone of item.phones) {
				let needAdd = false;
				if (phone.country_no == country_no && phone.phone_no.indexOf(phone_no) >= 0) {
					needAdd = true;
				}

				if (needAdd) {
					let key = item.name;
					if (onlyPhone) {
						// let key = country_no + phone_no;
						result[key] = {
							name: item.name,
							country_no: phone.country_no,
							phone_no: phone.phone_no,
							contractType: 0
						};
					} else {
						// let key = country_no + phone_no;
						result[key] = item;
						break;
					}
				}
			}
		}

		return result;
	}

	findUnknowWithPhone({country_no, phone_no}, onlyPhone = true) {
		let result = [];
		for (let item of this.unknowContent) {
			let name = item.name;
			let phone = Util.fixNumber(name);
			let needAdd = false;
			if (phone.country_no == country_no && phone.phone_no.indexOf(phone_no) >= 0) {
				needAdd = true;
			}
			if (needAdd) {
				let key = item.name;
				if (onlyPhone) {
					// let key = country_no + phone_no;
					result[key] = {name: name, country_no: phone.country_no, phone_no: phone.phone_no, contractType: 2};
				} else {
					// let key = country_no + phone_no;
					result[key] = item;
					break;
				}
			}
		}
		return result;
	}

	finListAllContentPhone(searchText) {

		let localC = this.findLocalWithkeywold(searchText);
		let content = this.findContentWithkeywold(searchText);
		let unKonows = this.findUnknowWithkeywold(searchText);

		let result = [...this.lastMessageData, ...this.nearlyPhones, ...content, ...localC, ...unKonows];
		let keySet = new Set();
		let tempN = []
		for (let item of result) {
			let key = item.country_no + " " + item.phone_no;
			if (!keySet.has(key) && item.fromphone != 'service' && item.tophone != 'service') {
				tempN.push({
					name: item.name,
					country_no: item.country_no,
					phone_no: item.phone_no,
					contractType: item.contractType
				});
				keySet.add(key);
			}
		}

		return tempN;
	}

	finListAllContentPhoneWithOutunKonows(searchText) {

		let localC = this.findLocalWithkeywold(searchText);
		let content = this.findContentWithkeywold(searchText);

		let result = [...content, ...localC];
		let keySet = new Set();
		let tempN = [];
		for (let item of result) {
			let key = item.country_no + " " + item.phone_no;
			if (!keySet.has(key)) {
				tempN.push({
					name: item.name,
					country_no: item.country_no,
					phone_no: item.phone_no,
					contractType: item.contractType
				});
				keySet.add(key);
			}
		}

		tempN = tempN.sort((item1, item2) => {
			return item1.contractType - item2.contractType;
		});

		return tempN;
	}


	/**
	 * 通过号码 查找用户
	 * @param country_no    区号
	 * @param phone_no        电话号码
	 * @param noEqual        是否全等（模糊查找）
	 * @param default_contract_id    优先查找用户ID
	 * @returns {{}|Array|*}
	 */
	finListAllContent2({country_no, phone_no}, noEqual = true, default_contract_id = "") {

		let localC = this.findLocalWithPhone({country_no, phone_no});
		let content = this.findContentWithPhone({country_no, phone_no});
		let unKonows = this.findUnknowWithPhone({country_no, phone_no});

		let result = {...unKonows, ...localC, ...content};
		if (Object.keys(result).length == 0 && !noEqual) {
			let phone = '+' + country_no + ' ' + phone_no;
			let key = country_no + phone_no;
			result[key] = {
				name: phone,
				contractType: 2,
				phones: [
					{label: '', number: phone, type: 0, country_no: country_no, phone_no: phone_no}
				]
			}
		}
		let r = [];
		let keys = Object.keys(result);
		keys.map((key) => {
			if (noEqual) {
				if (key !== country_no + phone_no) {
					r.push(result[key]);
				}
			} else {
				r.push(result[key]);
			}
		});

		if (default_contract_id.length > 0) {
			let def = this.listAllContent;
			for (let item of def) {
				if (item.id == default_contract_id) {
					for (let phone of item.phones) {
						if (phone.country_no == country_no && phone.phone_no == phone_no) {
							r = [item];
							break;
						}
					}
				}
			}
		}


		if (!noEqual) {
			if (r.length > 0) {
				return r[0];
			} else {
				return {}
			}
		}
		return r;
	}

	finListAllContent3({country_no, phone_no}, noEqual = true) {

		let localC = this.findLocalWithPhone({country_no, phone_no});
		let content = this.findContentWithPhone({country_no, phone_no});
		let result = {...localC, ...content};

		let r = [];
		let keys = Object.keys(result);
		keys.map((key) => {
			if (noEqual) {
				if (key !== country_no + phone_no) {
					r.push(result[key]);
				}
			} else {
				r.push(result[key]);
			}
		});

		if (!noEqual) {
			if (r.length > 0) {
				return r[0];
			} else {
				return null
			}

		}
		return r;
	}

	/**
	 * 统一输出信息结构 {name , contractType, phones:[{label, number, type, country_no, phone_no}]}
	 * @param country_no
	 * @param phone_no
	 * @returns {null|Array|*}
	 */
	finListAllContent4({country_no, phone_no}) {

		let localC = this.findLocalWithPhone({country_no, phone_no}, false);
		let content = this.findContentWithPhone({country_no, phone_no}, false);
		let unKonows = this.findUnknowWithPhone({country_no, phone_no}, false);

		let result = {...unKonows, ...localC, ...content};

		let r = [];
		let r0 = null;
		let keys = Object.keys(result);
		keys.map((key) => {
			r.push(result[key]);
		});

		if (r.length > 0) {
			r0 = r[0];
			return r0
		} else {
			let cont = {
				name: `+${country_no} ${phone_no}`,
				contractType: 2,
				id: `+${country_no} ${phone_no}`,
				phones: [
					{
						label: '',
						number: `+${country_no} ${phone_no}`,
						type: 0,
						country_no: country_no,
						phone_no: phone_no
					}
				]
			}
			return cont;
		}
	}

	finListContentPhone(searchText) {
		let result = [];
		for (let item of this.intelContent) {
			let name = item.name;
			for (let phone of item.phones) {
				let needAdd = false;
				let {country_no, phone_no} = phone;

				if (name.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (phone_no.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (country_no.indexOf(searchText) >= 0) {
					needAdd = true;
				}
				if (needAdd) {
					result.push({...item, ...phone})
				}
			}
		}

		// 去重
		let tempN = [];
		let keySet = new Set();
		for (let item of result) {
			let key = item.country_no + " " + item.phone_no;
			if (!keySet.has(key)) {
				tempN.push({
					name: item.name,
					country_no: item.country_no,
					phone_no: item.phone_no,
					contractType: item.contractType
				});
				keySet.add(key);
			}
		}
		return tempN;
	}

	@computed get sectionAllSecList() {
		let rsections = [];
		let rletterArr = [];

		let list = this.listAllContent;
		let sections = [],
			letterArr = [];
		// 右侧字母栏数据处理
		list.map((item, index) => {
			try {
				let first = item.name.replaceStart().substring(0, 1);
				letterArr.push(pinyin(first, {
					style: pinyin.STYLE_FIRST_LETTER,
				})[0][0].toUpperCase());
			} catch (e) {
			}
		});
		letterArr = [...new Set(letterArr)].sort();

		// 分组数据处理
		letterArr.map((item, index) => {
			sections.push({
				title: item,
				data: []
			})
		});
		rletterArr = [...letterArr];
		list.map(item => {
			let tempListItem = {...item};
			let name = tempListItem.name;
			tempListItem.name = name.replaceStart();
			let first = tempListItem.name.substring(0, 1);
			let test = pinyin(first, {style: pinyin.STYLE_FIRST_LETTER})[0][0].toUpperCase();
			for (let section of sections) {
				if (section.title == test) {
					section.data.push(tempListItem)
				}
			}
		});
		rsections = [...sections];

		return {sections: rsections, letterArr: rletterArr};
	}

	@computed get sectionAllSecList2() {
		let rsections = [];
		let rletterArr = [];

		let list = this.listAllContent2;
		let sections = [],
			letterArr = [];
		// 右侧字母栏数据处理
		list.map((item, index) => {
			try {
				let first = item.name.replaceStart().substring(0, 1);
				letterArr.push(pinyin(first, {
					style: pinyin.STYLE_FIRST_LETTER,
				})[0][0].toUpperCase());
			} catch (e) {
			}
		});
		letterArr = [...new Set(letterArr)].sort();

		// 分组数据处理
		letterArr.map((item, index) => {
			sections.push({
				title: item,
				data: []
			})
		});
		rletterArr = [...letterArr];
		list.map(item => {
			try {
				let tempListItem = {...item};
				let name = tempListItem.name;
				tempListItem.name = name.replaceStart();
				let first = tempListItem.name.substring(0, 1);
				let test = pinyin(first, {style: pinyin.STYLE_FIRST_LETTER})[0][0].toUpperCase();
				for (let section of sections) {
					if (section.title == test) {
						section.data.push(tempListItem)
					}
				}
			} catch (e) {
			}
		});
		rsections = [...sections];

		return {sections: rsections, letterArr: rletterArr};
	}

	@computed get sectionSecList() {
		let rsections = [];
		let rletterArr = [];
		let list = this.intelContent;
		let sections = [],
			letterArr = [];
		// 右侧字母栏数据处理
		list.map((item, index) => {
			try {
				let first = item.name.replaceStart().substring(0, 1);
				letterArr.push(pinyin(first.substring(0, 1), {
					style: pinyin.STYLE_FIRST_LETTER,
				})[0][0].toUpperCase());
			} catch (e) {
			}
		});
		letterArr = [...new Set(letterArr)].sort();
		// 分组数据处理
		letterArr.map((item, index) => {
			sections.push({
				title: item,
				data: []
			})
		});
		rletterArr = [...letterArr];
		list.map(item => {
			try {
				let tempListItem = {...item};
				let name = tempListItem.name;
				tempListItem.name = name.replaceStart();
				let first = tempListItem.name.substring(0, 1);
				let test = pinyin(first, {style: pinyin.STYLE_FIRST_LETTER})[0][0].toUpperCase();
				for (let section of sections) {
					if (section.title == test) {
						section.data.push(tempListItem)
					}
				}
			} catch (e) {
			}
		});
		rsections = [...sections];

		if (this.focusContractList.length > 0) {
			rletterArr = ['关', ...rletterArr];
			rsections = [
				{
					title: "特别关注",
					data: [
						...this.focusContractList,
					]
				},
				...rsections
			];
		}

		return {sections: rsections, letterArr: rletterArr};
	}

	intelContenToLo(content) {
		let phones = content.content.map((item) => {
			let label = '';
			switch (item.type) {
				case 0: {
					label = '家庭电话';
					break
				}
				case 1: {
					label = '办公电话';
					break
				}
				case 2: {
					label = '移动电话';
					break
				}
			}
			return {
				label: label,
				number: '+' + item.country_no + ' ' + item.phone_no,
				type: item.type,
				country_no: item.country_no,
				phone_no: item.phone_no
			}
		});
		let intContent = {
			id: content.id,
			name: content.cname,
			contractType: 0,
			phones: phones,
		}
		return intContent;
	}

	@action
	async addContent(content) {
		let intContent = this.intelContenToLo(content);
		if (intContent.name.length > 0) {
			this.intelContent.push(intContent);
			this.insertDBContent(content).then();
		}
		// 更新未知号码
		await this.updateUnknowPhone();
		return intContent;
	};

	@action
	updateContent(content) {
		let neetRemove = -1;
		this.intelContent.map((item, index) => {
			if (content.id == item.id) {
				neetRemove = index;
			}
		});
		if (neetRemove !== -1) {
			this.intelContent[neetRemove] = content;
			this.updateDBConten(content).then();
		}

	}

	@action
	async updateMessage() {
		console.log('更新最新消息');
		// 更新未知号码
		await this.updateUnknowPhone();

		this.nearlyPhones = await this.phoneService.getPhoneHistory();
		this.lastMessageData = await this.messageService.getMessageHistory();
	}

	@action
	removeContent(id) {
		let neetRemove = -1;
		this.intelContent.map(async (item, index) => {
			if (item.id == id) {
				neetRemove = index;
				// 联系人设置拆分到各个电话号码里
				await this.configService.deleteContractSettingConfig(item);
			}
		});
		if (neetRemove !== -1) {
			this.intelContent.splice(neetRemove, 1);
			this.contractService.deleteContent(id).then();
		}
		this.updateMessage().then();
	};

	@action
	async updateUnknowPhone() {
		let res = await this.dbAction.findAllUnknowPhoneNo();
		// this.unknowContent = res;
		let asd = {};
		res.map((item) => {
			asd[item.name] = item;
		});
		let result = [];
		Object.keys(asd).forEach((item) => {
			result.push(asd[item]);
		});
		this.unknowContent = result;

	};

	async addUnknowPhone(item) {
		// this.unknowContent.push(item)
		let res = [...this.unknowContent, item];
		let asd = {};
		res.map((item) => {
			asd[item.name] = item;
		});
		let result = [];
		Object.keys(asd).forEach((item) => {
			result.push(asd[item]);
		});
		this.unknowContent = result;
	}

	findContentWithID(id) {
		try {
			id = id.toString();
		} catch (e) {
		}
		let result = {};
		for (let item of this.intelContent) {
			if (item.id == id) {
				result = {...item};
			}
		}
		return result;
	}

	findAllContentWithID(id) {
		try {
			id = id.toString();
		} catch (e) {
		}
		let result = null;
		for (let item of this.listAllContent) {
			try {
				if (item.id == id) {
					result = {...item};
				}
			} catch (e) {
			}
		}
		return result;
	}

	findLocalContentWithName(name) {
		name = name.toString();
		let result = null;
		for (let item of this.localContent) {
			let r_name = item.name;
			if (r_name == name) {
				result = {...item};
			}
		}
		return result;
	}

	findContentWithName(name) {
		name = name.toString();
		let result = null;
		for (let item of this.intelContent) {
			if (item.name == name) {
				result = {...item};
			}
		}
		return result;
	}

	findUnknowContentWithName(name) {
		name = name.toString();
		let result = null;
		for (let item of this.unknowContent) {
			if (item.name == name) {
				result = {...item};
			}
		}
		return result;
	}

	async findAllContentWithName(name) {

		if (name && name != undefined) {
			let result1 = this.findLocalContentWithName(name);
			let result2 = this.findContentWithName(name);
			let result3 = this.findUnknowContentWithName(name);

			let end = result1 || result2 || result3;

			if (!end) {
				try {
					let {country_no, phone_no} = Util.fixNumber(name);
					let contract = {
						name: '+' + country_no + ' ' + phone_no,
						contractType: 2,
						phones: [
							{label: '', number: '', type: 0, country_no: country_no, phone_no: phone_no}
						]
					};
					await this.addUnknowPhone(contract);
					end = contract;
				} catch (e) {
				}
			}

			return end;

		} else {
			return {}
		}

	}


	async insertDBContent(content) {
		let data = content.content || content.phones;

		let {insertId} = await this.contractService.insertContent(content);

		for (let phone of data) {
			try {
				await this.contractService.inserContentPhone(insertId, phone)
			} catch (e) {

				console.log(content, phone)
			}
		}
	}

	async updateDBConten(content) {
		await this.contractService.deleteContent(content.id);
		await this.insertDBContent(content);
	}


	requestContactsPromisser({alert}) {
		return new Promise((resolve, reject) => {

			if (Platform.OS == 'android') {
				const permissions = [
					PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
					PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
				];

				PermissionsAndroid.requestMultiple(
					permissions
				).then((granteds) => {
					if (granteds["android.permission.READ_CONTACTS"] === "granted") {
						resolve();
					} else {
						reject();
					}
				});
			} else {
				Contacts.requestPermission((err, permission) => {
					if (err) throw err;
					if (permission === 'authorized') {
						// 同意!
						resolve();
					}
					if (permission === 'denied') {
						// 拒绝
						if (alert) {
							Alert.alert('访问通讯录权限没打开', '请在iPhone的“设置-隐私”选项中,允许访问您的通讯录', [{
								text: '确定', onPress: () => {
								}
							},], {cancelable: false});
						}

						reject();
					}
				})

			}
		})
	}


	updateLocalContract({alert} = {alert: true}) {

		this.requestContactsPromisser({alert})
			.then(() => {
				this.updateLocalContractNoPremisser()
			}, () => {
				this.localContent = [];
				this.needContactsPromisser = true;
			})
	}

	updateLocalContractNoPremisser() {
		Contacts.getAll((err, contacts) => {
			if (contacts) {
				let result = [];
				contacts.map((item, index) => {
					let phones = item.phoneNumbers.map((p, i) => {
						let {country_no, phone_no} = Util.fixNumber(p.number);
						return {
							label: p.label,
							number: p.number,
							type: i + 1,   // 类型从1开始算
							country_no,
							phone_no,
						}
					});
					if (phones.length > 0) {
						let {country_no, phone_no} = phones[0];
						let name = item.familyName + ' ' + item.givenName;
						if (name.length <= 1) {
							name = "+" + country_no + ' ' + phone_no
						}
						result.push({
							id: item.recordID,
							name: name,
							contractType: 1,
							phones: phones
						});
					}
				});
				this.localContent = result;

				let contenList = [];
				for (let item of this.localContent) {
					for (let phone of item.phones) {
						contenList.push({
							name: item.name,
							phone_no: phone.country_no + phone.phone_no
						});
					}
				}

				this.otherService.updateLocalContent(contenList);
			}
		})
	}

	addFocusContract(contract) {
		if (this.tempfocusContractList[contract.name] != undefined) {
			return false;
		} else {
			this.tempfocusContractList[contract.name] = contract;
			CustomStorage.setItem('tempfocusContractList', JSON.stringify(this.tempfocusContractList));
		}
	}

	isContance(contract) {
		if (this.tempfocusContractList[contract.name] != undefined) {
			return true;
		} else {
			return false;
		}
	}

	deleteFocusContract(name) {
		if (this.tempfocusContractList[name] != undefined) {
			delete this.tempfocusContractList[name]
		}
		CustomStorage.setItem('tempfocusContractList', JSON.stringify(this.tempfocusContractList));
	}


	/**
	 * 删除本地联系人
	 * @param contract
	 * @returns {Promise<Promise<any> | Promise<*>>}
	 */
	async deleteLocalContact(contract) {
		return new Promise((resolve) => {
			Contacts.getContactById(contract.id, (error: any, contact: Contact) => {
				Contacts.deleteContact(contact, () => {
					resolve();
				})
			})
		})
	}

	/**
	 * 删除联系人和聊天信息
	 * @param contract
	 */
	async deleteContractAndHistory(contract) {
		switch (contract.contractType) {
			case 0: {
				// 网络通讯录
				// 先请求删除用户
				await Req.post(URLS.DELETE_CONTACTS, {cid: contract.id});
				this.removeContent(contract.id);

				// 删除用户设置
				await this.configService.deleteContractSettingConfig(contract);
				break;
			}
			case 1: {
				// 本地通讯录
				await this.deleteLocalContact(contract);
				// 更新本地通讯录
				this.updateLocalContract();
				break;
			}
			case 2: {
				// 陌生号码
				// 删除用户设置
				await this.configService.deleteContractSettingConfig(contract);
				break;
			}
		}

		// 删除聊天记录
		for (let phone of contract.phones) {
			let phoneStr = '+' + phone.country_no + ' ' + phone.phone_no;
			await this.messageService.deleteMessageWithPhone(phoneStr);
			await this.recentService.deleteByPhone(phoneStr);
		}

		await this.updateMessage()
	}

}

export default AppStore;
