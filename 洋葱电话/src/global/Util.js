'use strict';
import moment from "moment";
import {Image, View} from "react-native";
import React from "react";
import pinyin from "pinyin";
import TextEx from "../components/TextEx";

String.prototype.replaceAll = function (search, replacement) {
	let temp = this + '';
	try {
		return temp.split(search).join(replacement);
	} catch (e) {
		return temp;
	}
};

String.prototype.replaceStart = function () {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};

class Util {

	static CountryList = {};

	static formatDate(date) {
		return moment(new Date(date)).format('YYYY-MM-DD');
	}

	static prefix(size, num) {
		var sLen = ('' + num).length;
		if (sLen >= size) {
			return '' + num;
		}
		var preZero = (new Array(size)).join('0');

		return preZero.substring(0, size - sLen) + num;
	}

	static CheckPhone(country_no, phone_no) {
		country_no = country_no.replaceAll('+', '');
		if (country_no == '86' || country_no == '086') {
			return /^[1]([3-9])[0-9]{9}$/.test(phone_no);
		} else {
			return phone_no.length >= 3 && country_no.length > 0;
		}
	}

	static cutPhoneNum(phone, country_no = '', region_no = '') {
		let index = -1;
		if (country_no.length > 0) {
			index = phone.indexOf(country_no);
			if (index == 0) {
				phone = phone.substring(country_no.length, phone.length);
				country_no += ' ';
			}
		}

		if (region_no.length > 0) {
			index = phone.indexOf(region_no);
			if (index == 0) {
				phone = phone.substring(region_no.length, phone.length);
				region_no += '-'
			}
		}

		return '+' + country_no + region_no + phone;
	}

	static fitArrayWithString(array = [], v = '') {
		let result = '';
		for (let item of array) {
			if (item.length > 0) {
				result += item + v;
			}
		}
		if (array.length > 0) {
			result = result.substring(0, result.length - v.length);
		}
		return result;
	}

	static findstring(str1, str2) {
		if (str1.length > 0) {
			return str1;
		} else {
			return str2;
		}
	}

	static foundArrayMapWithKey(searchkey, array, keys) {
		let result = [];
		for (let item of array) {
			let needAdd = false;
			for (let key of keys) {
				if (item[key].indexOf(searchkey) >= 0) {
					needAdd = true;
				}
			}
			if (needAdd) {
				result.push(item);
			}
		}
		return result;
	}

	static fixNumber(phoneNo) {
		let country_no = '';
		let phone_no = '';

		// 如果开始是+号
		if (phoneNo.substring(0, 1) == '+') {
			let c = phoneNo.split(" ")[0];
			if (c.length > 0 && c.length <= 4) {
				country_no = c.replace('+', '');
				phone_no = phoneNo.substring(c.length, phoneNo.length);
			} else {
				phoneNo = phoneNo.replaceAll('+', '')
			}
		} else if (phoneNo.indexOf('-')) {
			let c = phoneNo.split("-")[0];
			if (c.length > 0 && c.length <= 4) {
				country_no = c.replace('+', '');
				phone_no = phoneNo.substring(c.length, phoneNo.length);
			}
		}

		if (country_no.length <= 0) {
			for (let i = 1; i <= phoneNo.length; i++) {
				let tempCountry_no = phoneNo.substring(0, i);
				let countrys = Util.CountryList[tempCountry_no];
				if (countrys && countrys.country_no) {
					country_no = countrys.country_no;
					phone_no = phoneNo.substring(i, phoneNo.length);
				}
			}
		}

		if (country_no.length <= 0) {   // 括号开头
			phone_no = phoneNo.replaceAll('(', '').replaceAll(')', '');
			country_no = '1';
		}

		phone_no = phone_no.replaceAll('+', '').replaceAll(' ', '').replaceAll('-', '');

		return {phone_no, country_no}
	}

	static cutNameBigLetter(name: String) {
		if (name.startsWith('+')) {
			return '+';
		}

		let letterList = name.split(' ');
		let nameK = '';
		for (let item of letterList) {
			let first = item.replaceStart().substring(0, 1);
			nameK = nameK + pinyin(first, {
				style: pinyin.STYLE_FIRST_LETTER,
			})[0][0].toUpperCase()
		}
		return nameK;
	}

	static logoFix(name, contractType, size = 40) {
		let logo = null;
		switch (contractType) {
			case 1: {
				// 本地通讯录
				logo = (
					<View>
						{/*<Image*/}
						{/*	style={{width: size, height: size}}*/}
						{/*	source={require('../assets/img/icon/kbg.png')}*/}
						{/*/>*/}
						<View style={{width: size, height: size, backgroundColor: '#4A90E2', borderRadius: size}}/>
						<Image
							style={{width: size, height: size, position: 'absolute', left: 0, top: 0}}
							source={require('../assets/img/icon/phone.png')}
						/>
					</View>);
				break;
			}
			case 0: {
				logo = (
					<View>
						{/*<Image*/}
						{/*	style={{width: size, height: size}}*/}
						{/*	source={require('../assets/img/icon/kbg.png')}*/}
						{/*/>*/}
						<View style={{width: size, height: size, backgroundColor: '#4A90E2', borderRadius: size}}/>
						<Image
							style={{width: size, height: size, position: 'absolute', left: 0, top: 0}}
							source={require('../assets/img/icon/person.png')}
						/>
					</View>);
				break;
			}
			case 2: {
				// 陌生号码
				logo = (
					<View>
						{/*<Image*/}
						{/*	style={{width: size, height: size}}*/}
						{/*	source={require('../assets/img/icon/kbg.png')}*/}
						{/*/>*/}
						<View style={{width: size, height: size, backgroundColor: '#4A90E2', borderRadius: size}}/>
						<Image
							style={{width: size, height: size, position: 'absolute', left: 0, top: 0}}
							source={require('../assets/img/icon/person.png')}
						/>
					</View>);

				break;
			}
			case 4: {
				let rL = this.cutNameBigLetter(name);
				// 好友
				logo = (<View>
					{/*<Image*/}
					{/*	style={{width: size, height: size}}*/}
					{/*	source={require('../assets/img/icon/kbg.png')}*/}
					{/*/>*/}
					<View style={{width: size, height: size, backgroundColor: '#4A90E2', borderRadius: size}}/>
					<TextEx style={{
						width: size, height: size, position: 'absolute', left: 0, top: 0,
						right: 0, bottom: 0, textAlign: 'center', color: 'white',
						lineHeight: size, fontSize: 15
					}}>
						{rL}
					</TextEx>
				</View>);
			}
		}
		return logo
	}

	/**
	 * 活动状态 判断
	 * @param date
	 */
	static activeTimerDepark(startDate, endDate) {
		//  今天 0 时
		let today_zero = moment(new Date()).utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
		let today = moment(today_zero).utcOffset(480).toDate().getTime();

		let acDate_zero = moment(startDate).utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
		let acDate = moment(acDate_zero).utcOffset(480).toDate().getTime();

		let endDate_zero = moment(endDate).utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
		let enDate = moment(endDate_zero).utcOffset(480).toDate().getTime();

		let ehour = parseInt((today - enDate) / 1000.0 / 3600.0);
		if (ehour > 0) {
			// 活动已经结束
			return (<TextEx style={{fontSize: 10, color: '#999999'}}>已结束</TextEx>);
		} else {
			// 活动还没结束
			if (ehour >= -24) {
				return (<TextEx style={{fontSize: 10, color: '#5FADF8'}}>即将结束</TextEx>);
			} else {

				let hour = parseInt((today - acDate) / 1000.0 / 3600.0);

				if (hour > 0) {
					// 活动已经开始
					return (<TextEx style={{fontSize: 10, color: '#0FAA0C'}}>进行中</TextEx>);
				} else {
					// 活动还没开始
					return (<TextEx style={{fontSize: 10, color: '#FF6600'}}>即将开始</TextEx>);
				}
			}
		}


	}

	static phToassets(phLocalPath) {
		// let localfile = 'ph://ED7AC36B-A150-4C38-BB8C-B6D696F4F2ED/L0/001';
		// let assLocalfile = 'assets-library://asset/asset.HEIC?id=ED7AC36B-A150-4C38-BB8C-B6D696F4F2ED&ext=HEIC';

		if (/^assets-library/.test(phLocalPath)) {
			return phLocalPath;
		} else {
			try {
				let id = phLocalPath.match(/^ph:\/\/([a-zA-Z0-9-]*)\//)[1];
				return 'assets-library://asset/asset.HEIC?id=' + id + '&ext=HEIC';
			} catch (e) {
				return phLocalPath;
			}
		}

	}

	static fixDateToString() {

	}
}

export default Util;
