'use strict';
let ERROR = {
	31603: '对方拒绝接听',
	31408: '请求超时',
	53405: '对方拒绝接听',
	31486: '对方正忙',
	31484: '电话号码格式不正确',
	31480: '对方正忙',
};


export default function ERRORS(CODE){
	let MESSAGE = ERROR[CODE];
	if (MESSAGE && MESSAGE!=undefined && MESSAGE!=null){
		return MESSAGE
	} else {
		return "对方正忙";
	}
}
