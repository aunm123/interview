'use strict';
// var pinyin = require('pinyin');
//
// console.log(pinyin("萨", {
// 	style: pinyin.STYLE_FIRST_LETTER, // 设置拼音风格
// 	heteronym: true
// }));
// console.log(pinyin("萨", {
// 	style: pinyin.STYLE_FIRST_LETTER,
// })[0][0].toUpperCase());


// let aer = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
// console.log(aer.test('+8613'));

let mm = [
	'AT',
	'AU',
	'AW',
	'AZ',
	'BA',
	'BB',
	'BD',
	'BE',
	'BF',
	'BG',
	'BH',
	'BI',
	'BJ',
	'BM',
	'BN',
	'BO',
	'BR',
	'BS',
	'BT',
	'BV',
	'BW',
	'BY',
	'BZ',
	'CA',
	'CC',
	'CF',
	'CG',
	'CI',
	'CK',
	'CL',
	'CM',
	'CN',
	'CO',
	'CR',
	'CU',
	'CV',
	'CX',
	'CY',
	'CZ',
	'DE',
	'DJ',
	'DK',
	'DM',
	'DO',
	'DZ',
	'EC',
	'EE',
	'EG',
	'ER',
	'ET',
	'FI',
	'FJ',
	'FK',
	'FO',
	'FR',
	'FX',
	'GA',
	'GD',
	'GE',
	'GF',
	'GH',
	'GI',
	'GL',
	'GM',
	'GN',
	'GP',
	'GQ',
	'GR',
	'GT',
	'GU',
	'GW',
	'GY',
	'HK',
	'HM',
	'HN',
	'HR',
	'HT',
	'HU',
	'ID',
	'IE',
	'IL',
	'IM',
	'IN',
	'IO',
	'IQ',
	'IR',
	'IS',
	'IT',
	'JM',
	'JO',
	'JP',
	'KE',
	'KG',
	'KH',
	'KI',
	'KM',
	'KW',
	'KY',
	'KZ',
	'LA',
	'PF',
	'SV',
	'TD',
	'TF',
	'TP',
	'ZR',
];
let resutl = mm.map((item)=>{
	let value = ' require(\'../../assets/counrtyimg/'+item+'.png\'),'
	console.log(item + ':' + value)
})
