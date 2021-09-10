'use strict';
import md5 from 'md5';
import {HttpGet, HttpPost} from "./HttpUtil";
import URLS from "../value/URLS";

const host = 'http://api.test.ssyx99.com/';
const phone_host = "http://61.14.253.56:9999/";


class Req {

	static global;
	static store;

	static initGlobal(global, store) {
		Req.global = global;
		Req.store = store;
	}

	static get_org(url) {
		return HttpGet(url)
	}

	static post_org(url, params = {}) {
		let formData = new FormData();
		Object.keys(params).forEach(key => {
			formData.append(key, params[key]);
		});

		return HttpPost(url, formData);
	}


	static createXhrUpload(url, params = {}, fileData, progressCallback = ()=>{}, successBlock, faileBlock, isPhoneHost = false){
		let xhr = new XMLHttpRequest();
		let resParams = Req.mdk(params);

		let h = isPhoneHost ? phone_host : host;
		// h = "http://localhost:3000/";/**/

		xhr.open('POST', h + url);
		xhr.setRequestHeader('Content-Type', 'multipart/form-data')
		xhr.onload = (res) => {					//请求完成
			if (xhr.status !== 200) {
				console.log(res)
				faileBlock("未知错误", xhr.response)
				return;
			}
			// upload succeeded
			let responseData = JSON.parse(xhr.response);
			if (parseInt(responseData.status, 10) == 1) {
				successBlock(responseData);
			} else {
				Req.faileBlock(responseData, faileBlock, h + url)
			}

		};
		xhr.ontimeout = () => {
			faileBlock("连接超时");
		};
		xhr.onerror = (error) => {					//请求失败
			faileBlock(error.toLocaleString());
		};

		let formData = new FormData();
		formData.append('upfile', fileData);
		Object.keys(resParams).forEach(key => {
			formData.append(key, resParams[key]);
		});

		if (xhr.upload) {
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					let present = parseInt((event.loaded / event.total) * 100, 10);
					if (present < 100) {
						progressCallback(present / 100.0)
					} else {
						progressCallback(1)
					}
				}
			};
		}
		return {xhr, formData}
	}

	static get(url, params = {}, isPhoneHost = false) {
		let paramsStr = '';
		let resParams = Req.mdk(params);
		Object.keys(resParams).forEach(key => {
			paramsStr += key + '=' + resParams[key];
			paramsStr += '&';
		});
		paramsStr = paramsStr.substring(0, paramsStr.length - 1);
		let h = isPhoneHost ? phone_host : host;
		let resultURL =
			paramsStr.length === 0 ? h + url : h + url + '?' + paramsStr;

		console.log(url, "GET");

		return new Promise((resolve, reject) => {
			Req.get_org(resultURL)
				.then(response => JSON.parse(response))
				.then(responseData => {
					if (parseInt(responseData.status, 10) == 1) {
						resolve(responseData);
					} else {
						console.log('失败', responseData);
						console.log(h + url, "POST");
						console.log(resParams);

						Req.faileBlock(responseData, reject, resultURL)
					}
				})
				.catch(error => {
					console.log('失败', error);
					Req.global.dismissLoading();
					Req.global.presentMessage('请求失败，请检查网络！');
				})
				.done();
		});
	}

	static post(url, params = {}, isPhoneHost = false, specialAction=null) {
		let resParams = Req.mdk(params);

		let h = isPhoneHost ? phone_host : host;

		return new Promise((resolve, reject = () => {
		}) => {
			Req.post_org(h + url, resParams)
				.then(response => JSON.parse(response))
				.then(responseData => {
					if (parseInt(responseData.status, 10) == 1) {
						console.log(h + url, "POST");
						console.log(resParams);
						console.log('成功', responseData);

						resolve(responseData);
					} else {
						console.log('失败', responseData);
						console.log(h + url, "POST");
						console.log(resParams);

						Req.faileBlock(responseData, reject, h + url, url).then()
					}

					if (specialAction){
						specialAction(responseData)
					}
				})
				.catch(error => {
					console.log('失败', error);
					console.log(h + url, "POST");
					console.log(resParams);
					Req.global.dismissLoading();
					Req.global.presentMessage('请求失败，请检查网络！');
					if (reject) {
						reject({});
					}
				})
				.done();
		});
	}

	static async faileBlock(responseData, reject, url, surl) {
		Req.global.dismissLoading();
		Req.global.presentMessage(responseData.message);
		if (reject) {
			reject(responseData);
		}
		let status = parseInt(responseData.status, 10);
		if (status === 2001) {
			await Req.global.logout();
			await Req.store.logout();
			Req.global.nav.popToTop()
		}
		if (status === 2002) {
			await Req.global.logout();
			await Req.store.logout();
			Req.global.nav.popToTop();
		}
		if (status === 2003) {
			await Req.global.logout();
			await Req.store.logout();
			Req.global.nav.popToTop();
		}
		if (status === 2004) {
			await Req.global.logout();
			await Req.store.logout();
			Req.global.nav.popToTop();
		}

	}

	static mdk(params) {
		let copy_params = {...params};

		if (Req.global.userid) {
			copy_params['userid'] = Req.global.userid;
		}
		let temp = {};
		if (copy_params.capabilities) {
			temp.capabilities = copy_params.capabilities;
			delete copy_params['capabilities'];
		}

		let token = 'GDePxNX5rLOIx7bve7n9';
		let arrayObj = Object.keys(copy_params).sort();
		let result = '';
		arrayObj.map((item) => {
			let r = copy_params[item];
			if ((typeof r) == 'object') {
				r = JSON.stringify(r);
			}
			result += r
		});
		result += token;
		console.log("=============", result);
		result = md5(result);

		copy_params['sign'] = result;

		if (Req.global.token) {
			copy_params['authToken'] = Req.global.token;
		}

		let res = {...copy_params, ...temp};

		let data = JSON.stringify(res);
		return {data};
	}
}

export default Req;
