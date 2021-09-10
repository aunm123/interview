// 'use strict';
// function cutPhoneNum(phone, country_no, region_no) {
// 	let index = -1;
// 	if (country_no.length>0){
// 		index = phone.indexOf(country_no);
// 		if (index == 0){
// 			phone =  phone.substring(country_no.length, phone.length);
// 			country_no += ' ';
// 		}
// 	}
//
// 	if (region_no.length>0){
// 		index = phone.indexOf(region_no);
// 		if (index == 0){
// 			phone =  phone.substring(region_no.length, phone.length);
// 			region_no += '-'
// 		}
// 	}
//
// 	return '+' + country_no + region_no + phone;
// }
//
// console.log(cutPhoneNum('1928664466', '1', '928'))

// String.prototype.replaceAll = function (search, replacement) {
// 	let target = this;
// 	return target.split(search).join(replacement);
// };
//
// function fixNumber(phoneNo) {
// 	let country_no = '';
// 	let phone_no = '';
// 	// 如果开始是+号
// 	if (phoneNo.substring(0, 1) == '+') {
// 		let c = phoneNo.split(" ")[0];
// 		if (c.length > 0 && c.length <= 4) {
// 			country_no = c.replace('+', '');
// 			phone_no = phoneNo.substring(c.length, phoneNo.length);
// 		}
// 	} else if(phoneNo.indexOf('-')){
// 		let c = phoneNo.split("-")[0];
// 		if (c.length > 0 && c.length <= 4) {
// 			country_no = c.replace('+', '');
// 			phone_no = phoneNo.substring(c.length, phoneNo.length);
// 		}
// 	} else {
// 		// 没有+号 获取括号内容
// 		let result = phoneNo.match(/\(([^)]*)\)/);
// 		if (result && result.length>0){
// 			result = result[1];
// 			if (result.length > 0 && result.length <= 4) {
// 				country_no = result;
// 				let index = phoneNo.indexOf(result);
// 				phone_no = phoneNo.substring(index + result.length + 1, phoneNo.length);
// 			}
// 		}
// 	}
//
// 	if (country_no.length <= 0) {
// 		phone_no = phoneNo;
// 		country_no = '1'
// 	}
// 	phone_no = phone_no.replaceAll('+', '').replaceAll(' ', '').replaceAll('-', '');
//
// 	return {phone_no, country_no}
//
// }
//
// console.log(fixNumber("888-555-5512"));


// function fitPhoneCode(phone){
// 	let regexp= /^(\\+\\d{2}-)?(\\d{2,3}-)?([1][3,4,5,7,8][0-9]\\d{8})$/
// 	let result = regexp.test(phone);
// 	return result;
// }
//
// console.log(fitPhoneCode("+85515288763"))


let srt = "        ";
console.log(srt.replace(/(^\s*)|(\s*$)/g, "").length);


