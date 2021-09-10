var Fly = require("flyio/dist/npm/fly");
// Node 入口
// var Fly=require("flyio/src/node")
var fly = new Fly;

//post
const HttpPost = (url, formData, timeout = 30 * 1000) => {
	return new Promise((resolve, reject) => {
		fly.request(url, formData, {
			method: "post",
			timeout: timeout,
		})
			.then(function (res) {
				resolve(res.data);
			})
			.catch(function (err) {
				reject(new Error(err))
			});
	})

};

//get
const HttpGet = (url, timeout = 30 * 1000) => {
	return new Promise((resolve, reject) => {
		fly.request(url, {}, {
			method: "GET",
			timeout: timeout,
		})
			.then(function (res) {
				resolve(res.data);
			})
			.catch(function (err) {
				reject(new Error(err))
			});
	})

};

export {HttpPost, HttpGet}
