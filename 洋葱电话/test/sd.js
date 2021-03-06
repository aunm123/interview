'use strict';
var fs = require('fs');
let  join = require('path').join;

let mm = [
	'AF',
	'AL',
	'DZ',
	'AS',
	'AD',
	'AO',
	'AI',
	'AQ',
	'AG',
	'AR',
	'AM',
	'AW',
	'AU',
	'AT',
	'AZ',
	'BS',
	'BH',
	'BD',
	'BB',
	'BY',
	'BE',
	'BZ',
	'BJ',
	'BM',
	'BT',
	'BO',
	'BA',
	'BW',
	'BV',
	'BR',
	'IO',
	'BN',
	'BG',
	'BF',
	'BI',
	'KH',
	'CM',
	'CA',
	'CV',
	'KY',
	'CF',
	'TD',
	'CL',
	'CN',
	'CX',
	'CC',
	'CO',
	'KM',
	'CG',
	'ZR',
	'CK',
	'CR',
	'CI',
	'HR',
	'CU',
	'CY',
	'CZ',
	'DK',
	'DJ',
	'DM',
	'DO',
	'TP',
	'EC',
	'EG',
	'SV',
	'GQ',
	'ER',
	'EE',
	'ET',
	'FK',
	'FO',
	'FJ',
	'FI',
	'FR',
	'FX',
	'GF',
	'PF',
	'TF',
	'GA',
	'GM',
	'GE',
	'DE',
	'GH',
	'GI',
	'GR',
	'GL',
	'GD',
	'GP',
	'GU',
	'GT',
	'GN',
	'GW',
	'GY',
	'HT',
	'HM',
	'HN',
	'HK',
	'HU',
	'IS',
	'IN',
	'ID',
	'IR',
	'IQ',
	'IE',
	'IM',
	'IL',
	'IT',
	'JM',
	'JP',
	'JO',
	'KZ',
	'KE',
	'KI',
	'KW',
	'KG',
	'LA',
	'LV',
	'LB',
	'LS',
	'LR',
	'LY',
	'LI',
	'LT',
	'LU',
	'MO',
	'MG',
	'MW',
	'MY',
	'MV',
	'ML',
	'MT',
	'MH',
	'MQ',
	'MR',
	'MU',
	'YT',
	'MX',
	'FM',
	'MD',
	'MC',
	'MN',
	'MNE',
	'MS',
	'MA',
	'MZ',
	'MM',
	'NA',
	'NR',
	'NP',
	'NL',
	'AN',
	'NC',
	'NZ',
	'NI',
	'NE',
	'NG',
	'NU',
	'NF',
	'KP',
	'MP',
	'NO',
	'OM',
	'PK',
	'PW',
	'PS',
	'PA',
	'PG',
	'PY',
	'PE',
	'PH',
	'PN',
	'PL',
	'PT',
	'PR',
	'QA',
	'RE',
	'RO',
	'RU',
	'RW',
	'KN',
	'LC',
	'VC',
	'WS',
	'SM',
	'ST',
	'SA',
	'SN',
	'RS',
	'SC',
	'SL',
	'SG',
	'SK',
	'SI',
	'SB',
	'SO',
	'ZA',
	'KR',
	'ES',
	'LK',
	'SH',
	'PM',
	'SD',
	'SR',
	'SJ',
	'SZ',
	'SE',
	'CH',
	'SY',
	'TW',
	'TJ',
	'TZ',
	'TH',
	'MK',
	'TG',
	'TK',
	'TO',
	'TT',
	'TN',
	'TR',
	'TM',
	'TC',
	'TV',
	'UG',
	'UA',
	'AE',
	'GB',
	'US',
	'UM',
	'UY',
	'UZ',
	'VU',
	'VA',
	'VE',
	'VN',
	'VG',
	'VI',
	'WF',
	'EH',
	'YE',
	'YU',
	'ZM',
	'ZW',
];

function findSync(startPath) {
	let result=[];
	function finder(path) {
		let files=fs.readdirSync(path);
		files.forEach((val,index) => {
			let fPath=join(path,val);
			let stats=fs.statSync(fPath);
			if(stats.isDirectory()) finder(fPath);
			if(stats.isFile()) {
				let name = val.substring(0, 2)
				result.push(name);
			}
		});

	}
	finder(startPath);
	return result;
}
let fileNames=findSync('../src/assets/counrtyimg');
let fset = new Set(fileNames);
fileNames = Array.from(fset);

let m = [];
mm.map((item)=>{
	if (!fset.has(item)){
		m.push(item)
	}
});

let temp = 'SELECT * FROM contact WHERE `country_code` = "BV"';

let str = ''
m.map((item)=>{
	str += " OR `country_code` = '"+item+"'"
});

console.log(str)
