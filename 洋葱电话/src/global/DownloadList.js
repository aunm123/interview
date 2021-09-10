'use strict';
import md5 from "md5";
import URLS from "../value/URLS";
import Req from "./req";
import PhotoDao from "../dao/PhotoDao";
import Util from "./Util";
import * as RNFS from "react-native-fs";
import AutoSave from "../TModal/AutoSave";
import CustomStorage from "./CustomStorage";

function getFileType(headers) {
	let result = "";
	try {
		switch (headers["Content-Type"]) {
			case "audio/x-wav": {
				result = "wav";
				break;
			}
			case "audio/mpeg": {
				result = "mp3";
				break;
			}
		}
	} catch (e) {
		result = "wav"
	}
	return result;
}

export class DownloadTask {

	@AutoSave
	MessageService;
	@AutoSave
	PhotoService;
	@AutoSave
	Download;

	progress;
	taskid;
	watchProgressCallback = null;
	finishBlock;

	promise: Promise;

	fromUrl;
	tempDownloadDest = "";
	downloadDest = "";

	cache: null;

	constructor(params = {}, fromUrl) {
		this.taskid = md5(Math.random().toString() + new Date().getDate().toString());
		this.fromUrl = fromUrl;

		console.log(cacheList);
		let cache = cacheList[md5(fromUrl)];
		if (cache){
			this.cache = cache['fileName'];
			return this;
		}
		console.log('需要下载');
		this.progress = 0;
		// 图片
		// const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.jpg`;
		// const fromUrl = 'http://img.kaiyanapp.com/c7b46c492261a7c19fa880802afe93b3.png?imageMogr2/quality/60/format/jpg';

		// 文件
		// const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.zip`;
		// const fromUrl = 'http://files.cnblogs.com/zhuqil/UIWebViewDemo.zip';

		// 视频
		// const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.mp4`;
		// http://gslb.miaopai.com/stream/SnY~bbkqbi2uLEBMXHxGqnNKqyiG9ub8.mp4?vend=miaopai&
		// https://gslb.miaopai.com/stream/BNaEYOL-tEwSrAiYBnPDR03dDlFavoWD.mp4?vend=miaopai&
		// const fromUrl = 'https://gslb.miaopai.com/stream/9Q5ADAp2v5NHtQIeQT7t461VkNPxvC2T.mp4?vend=miaopai&';


		// 音频
		const tempName = ((Math.random() * 100000) | 0) + "_" + ((Math.random() * 100000) | 0) + "_" + ((Math.random() * 100000) | 0);
		let tempDownloadDest = `${RNFS.DocumentDirectoryPath}/temp/${tempName}`;
		console.log(tempDownloadDest);

		const options = {
			fromUrl: fromUrl,
			toFile: tempDownloadDest,
			background: true,
			begin: (res) => {
				console.log('begin', res);
				console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
				let type = getFileType(res.headers);
				this.downloadDest = `${RNFS.DocumentDirectoryPath}/mp3Voice/${tempName}.${type}`;
			},
			progress: (res) => {
				let cProgress = res.bytesWritten / res.contentLength;
				if (this.watchProgressCallback) {
					this.watchProgressCallback(cProgress)
				}
			}
		};

		this.tempDownloadDest = tempDownloadDest;
		try {
			const ret = RNFS.downloadFile(options);
			this.promise = ret.promise;
		} catch (e) {
			if (this.finishBlock) {
				this.finishBlock()
			}
		}

		return this;
	}

	watchProgress(callback) {
		this.watchProgressCallback = callback;
	}

	stopWatchProgress() {
		this.watchProgressCallback = null;
	}

	stopFinishBlock() {
		this.finishBlock = null;
	}

	setFinishBlock(finishBlock) {
		this.finishBlock = finishBlock;
	}

	startDownload() {

		if (this.cache) {
			if (this.finishBlock) {
				this.finishBlock(this.cache)
			}
			return;
		}


		this.promise
			.then(res => {
				if (res.statusCode == '404') {
					console.log('下载失败404');
					if (this.finishBlock) {
						this.finishBlock()
					}
					return;
				}
				console.log('下载文件成功', res, this.downloadDest, this.tempDownloadDest);
				return RNFS.moveFile(this.tempDownloadDest, this.downloadDest);

			})
			.then(()=>{
				// let localPath = 'file://' + this.downloadDest;
				// let localPath = this.downloadDest;

				let cache = {name: this.fromUrl, fileName: this.downloadDest};
				cacheList[md5(this.fromUrl)] = cache;
				syncCacheList();
				if (this.finishBlock) {
					this.finishBlock(this.downloadDest)
				}
			})
			.catch(err => {
				console.log('下载失败', err);
				if (this.finishBlock) {
					this.finishBlock()
				}
			});
	}
}


let globalDownloadlist = {};
let cacheList = {};

function syncCacheList() {
	let cacheListJson = JSON.stringify(cacheList);
	CustomStorage.setItem('globalDownloadListCache', cacheListJson)
}
function clearCacheList() {
	CustomStorage.setItem('globalDownloadListCache', "{}")
}

class DownloadList {

	async initData() {
		try {
			await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/temp`);
		} catch (e) {
		}
		await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/mp3Voice`);
		let downloadCache = await CustomStorage.getItem('globalDownloadListCache');
		downloadCache = JSON.parse(downloadCache);
		cacheList = {...downloadCache};
	}

	get list() {
		return globalDownloadlist
	}

	destructor() {
		console.log('destructor globalUploadlist');
		// let keys = Object.keys(this.list);
		// for (let key of keys) {
		// 	let task: UploadTask = this.list[key];
		// 	task.stopUpload();
		// }
	}

	getTaskWithId(taskid) {
		if (taskid) {
			return this.list[taskid];
		} else {
			return null;
		}
	}

	createDownloadTask(params = {}, fromurl) {
		let task = new DownloadTask(params, fromurl);
		return {task, taskid: task.taskid, cache: null};
	}

	startDownloadTask(task: DownloadTask) {
		try {
			this.list[task.taskid] = task;
			task.startDownload();
		} catch (e) {

		}
	}

}

exports.DownloadList = DownloadList;
