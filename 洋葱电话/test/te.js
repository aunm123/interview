// let phLocalPath = 'ph://ED7AC36B-A150-4C38-BB8C-B6D696F4F2ED/L0/001'
// let id = phLocalPath.match(/^ph:\/\/([a-zA-Z0-9|-]*)\//);
// console.log(id)


// console.log(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g.test('asdasd'))


let moment = require('moment');

// let str = '123123s123123'
// if (str.match(/^[0-9]+$/)) {
// 	console.log('match')
// } else {
// 	console.log('no match')
// }

function et8(date) {
	let targetTimezone = -8;
// 当前时区与中时区时差，以min为维度
	let _dif = date.getTimezoneOffset();
// 本地时区时间 + 时差  = 中时区时间
// 目标时区时间 + 时差 = 中时区时间
// 目标时区时间 = 本地时区时间 + 本地时区时差 - 目标时区时差
// 东9区时间
	let east9time = date.getTime() + _dif * 60 * 1000 - (targetTimezone * 60 * 60 * 1000);
	return new Date(east9time)
}


Date.prototype.format = function (fmt) { //author: meizz 
	let o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (let k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
};

console.log(moment(new Date()).utcOffset(480).format('YYYY-MM-DD HH:mm:ss'))
console.log(et8(new Date()).format('yyyy-MM-dd hh:mm:ss'));
