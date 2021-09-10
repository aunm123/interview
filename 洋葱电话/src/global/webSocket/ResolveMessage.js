class ResolveMessage {

	onServuceError;
	onHeardMessage;
	onNeedCloseWs;
	onLoadMessage;
	onLineMessage;
	onGetMessage;
	onMoneyChange;
	onVerifyCaller;

	resolve(dataJSON) {

		const dataObject = JSON.parse(dataJSON);

		// // tslint:disable-next-line:radix
		// if (parseInt(dataObject.status) === 0) {
		// 	if (this.onServuceError) {
		// 		this.onServuceError();
		// 	}
		// 	return [{
		// 		title: '联系不上服务器，请检查网络！！',
		// 		style: 'system',
		// 		from: 'system',
		// 		time: '',
		// 	}];
		// }

		const cmd = dataObject.cmd;
		let array = [];
		switch (cmd) {
			case 'load': {
				console.log(dataObject);
				array = dataObject.message;
				if (this.onLoadMessage) {
					this.onLoadMessage(array);
				}
				break;
			}
			case 'send': {
				array = dataObject.message.map((item) => {
					const result = this.parseMessage(item);
					if (result != null) {
						return result;
					}
				});
				break;
			}
			case 'heartbeat': {
				if (this.onHeardMessage) {
					this.onHeardMessage();
					return;
				}
				break;
			}
			case 'quit': {
				break;
			}
			case 'online': {
				if (this.onLineMessage) {
					this.onLineMessage();
					return;
				}
				break;
			}
			case 'system': {
				array = dataObject.message.map((item) => {
					const result = this.parseMessage(item);
					if (result != null) {
						return result;
					}
				});
				break;
			}
			case 'sms_reply': {   // 短信推送
				array = dataObject;
				if (this.onGetMessage) {
					this.onGetMessage(array);
				}
				break;
			}
			case 'balance': {    // 余额
				array = dataObject;
				if (this.onMoneyChange) {
					this.onMoneyChange(array);
				}
				break;
			}
			case 'verify_caller': {		// 自定义来电显示推
				array = dataObject;
				if (this.onVerifyCaller) {
					this.onVerifyCaller(array);
				}
				break;
			}
			default: {
				return {};
			}
		}

		return array;
	}

	parseMessage(item) {
		// // @ts-ignore
		// const time = new Date(item.time * 1000).format('yyyy-MM-dd HH:mm:ss');
		// let title = '';
		// let data = [];
		// let style = '';
		// const name = item.userid;
		// const datetime = item.time * 1000;
		// const index = item.index;
		//
		// switch (item.msg.style) {
		// 	case 'tplname': {
		// 		style = 'tplname';
		// 		data = item.msg.content.map((value) => {
		// 			return {
		// 				type: value.type,
		// 				name: value.tplname,
		// 				id: value.id,
		// 			};
		// 		});
		// 		title = item.msg.title;
		// 		if (this.onAgentDate) {
		// 			const agentData = {
		// 				id: item.userid,
		// 				name: item.uname,
		// 			};
		// 			this.onAgentDate(agentData);
		// 		}
		// 		if (this.onPayData) {
		// 			this.onPayData(data);
		// 		}
		// 		break;
		// 	}
		// 	case 'string': {
		// 		style = 'string';
		// 		title = item.msg.content;
		// 		break;
		// 	}
		// 	case 'temporary':
		// 	case 'temporary_alipay':
		// 	case 'temporary_other':
		// 	case 'alipay':
		// 	case 'alipay_2':
		// 	case 'alipay_3':
		// 	case 'wx':
		// 	case 'hb':
		// 	case 'credit':
		// 	case 'bank':
		// 	case 'ysf_1':
		// 	case 'ysf_2':
		// 	case 'ysf_3': {
		// 		style = 'tplrow';
		// 		data = {...item.msg};
		// 		break;
		// 	}
		//
		// 	case 'upload_screenshot': {
		// 		style = 'photo';
		// 		data = {...item.msg};
		// 		break;
		// 	}
		// }
		// item.type = parseInt(item.type, 10);
		// // tslint:disable-next-line:triple-equals
		// if (item.type == 3 || item.type == 4 || item == 5) {
		// 	return null;
		// }
		// // tslint:disable-next-line:triple-equals
		// const from = item.type == 1 ? 'client' : (item.type == 2 ? 'service' : (item.type == 0 ? 'system' : 'other'));
		// const resultItem = {
		// 	index,
		// 	time,
		// 	title,
		// 	style,
		// 	data,
		// 	from,
		// 	name,
		// 	datetime,
		// 	read: item.reader === 'all'
		// };
		//
		//
		// if (from === 'system') {
		// 	resultItem.style = 'system';
		// 	if (item.msg.score !== undefined && this.onNeedCloseWs) {
		// 		const statusKK = parseInt(item.status, 10);
		// 		resultItem.data = {
		// 			// @ts-ignore
		// 			score: parseFloat(item.msg.score, 10),
		// 			statusCode: statusKK === 200 ? 0 : statusKK === 300 ? 1 : 2,
		// 			status: statusKK === 200 ? '已完成' : statusKK === 300 ? '已取消' : '进行中',
		// 		};
		// 		// @ts-ignore
		// 		if (resultItem.data.score <= 0 && resultItem.data.statusCode === 0) {
		// 			// @ts-ignore
		// 			resultItem.data.status = '已结束';
		// 		}
		// 		this.onNeedCloseWs(resultItem);
		// 	}
		// }
		//
		// return resultItem;
	}

}

export default new ResolveMessage();
