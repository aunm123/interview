'use strict';
import md5 from "md5";
import URLS from "../value/URLS";
import Req from "./req";
import PhotoDao from "../dao/PhotoDao";
import Util from "./Util";
import * as RNFS from "react-native-fs";
import AutoSave from "../TModal/AutoSave";

export class UploadTask {

	@AutoSave
	MessageService;
	@AutoSave
	PhotoService;
	@AutoSave
	Download;

	progress;
	taskid;
	watchProgressCallback = null;
	messageId;
	photoId;
	finishBlock;

	xhr : XMLHttpRequest;
	formData: FormData;

	/**
	 * 设置上传图片的缓存，避免下载网络图片
	 * @param intelPhotoPath 网络图片地址
	 * @param localPhotoPath 本地图片地址
	 */
	async saveUploadPhotoToLocalCache(intelPhotoPath, localPhotoPath) {
		try {
			let assPath = Util.phToassets(localPhotoPath)
			const {cachePath} = await this.Download.filePathRand('local', localPhotoPath, 'jpeg');
			// 复制本地图片到项目cache管理文件夹
			await RNFS.copyAssetsFileIOS(assPath, cachePath, 0, 0);
			// 设置网络地址对应本地文件缓存
			await this.Download.saveCacheKey(intelPhotoPath, cachePath)
		}catch (e) {
			console.log("缓存错误", e);
		}
	}

	constructor(url, params = {}, fileData) {
		this.taskid = md5(Math.random().toString() + new Date().getDate().toString());
		this.progress = 0

		let {xhr, formData} = Req.createXhrUpload(url, params, fileData,
			(cProgress) => {
				if (this.watchProgressCallback) {
					this.watchProgressCallback(cProgress)
				}
			}, async (res) => {
				console.log('上传成功1', res.data.big_img_url, fileData.uri);

				let localPhoto: PhotoDao = await this.PhotoService.getPhotoById(this.photoId);
				await this.saveUploadPhotoToLocalCache(res.data.big_img_url, localPhoto.big_url);

				let photo = new PhotoDao();
				photo.big_url = res.data.big_img_url;
				photo.small_url = res.data.small_img_url;
				photo.id = this.photoId;
				photo.isUpload = 1;
				await this.PhotoService.updatePhotoParams(photo);
				await this.MessageService.UpdateMessageStateWithContent({
					state: 2,
					content: JSON.stringify({photoid: this.photoId,}),
					id: this.messageId
				});
				if (this.finishBlock) {
					this.finishBlock(res.data)
				}

			}, async (error) => {
				console.log('上传失败', error)
				await this.MessageService.UpdateMessageStateWithContent({
					state: 1,
					content: JSON.stringify({photoid: this.photoId,}),
					id: this.messageId
				});
				if (this.finishBlock) {
					this.finishBlock()
				}
			});

		this.xhr = xhr;
		this.formData = formData;


		return this;
	}

	async stopUpload() {
		this.xhr.abort();
		await this.MessageService.UpdateMessageStateWithContent({
			state: 1,
			content: JSON.stringify({photoid: this.photoId,}),
			id: this.messageId
		});
		if (this.finishBlock) {
			this.finishBlock()
		}
		delete globalUploadlist[this.taskid]
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

	startUpload() {
		this.xhr.send(this.formData)
	}
}

export class UpLoadTaskCustomer {
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

	xhr : XMLHttpRequest;
	formData: FormData;

	/**
	 * 设置上传图片的缓存，避免下载网络图片
	 * @param intelPhotoPath 网络图片地址
	 * @param localPhotoPath 本地图片地址
	 */
	async saveUploadPhotoToLocalCache(intelPhotoPath, localPhotoPath) {
		try {
			const {cachePath} = await this.Download.filePathRand('local', localPhotoPath, 'jpeg');
			// 复制本地图片到项目cache管理文件夹
			await RNFS.copyFile(localPhotoPath, cachePath);
			// 设置网络地址对应本地文件缓存
			await this.Download.saveCacheKey(intelPhotoPath, cachePath)
		}catch (e) {
			console.log("缓存错误", e);
		}
	}

	constructor(url, params = {}, fileData) {
		this.taskid = md5(Math.random().toString() + new Date().getDate().toString());
		this.progress = 0;

		let {xhr, formData} = Req.createXhrUpload(url, params, fileData,
			(cProgress) => {
				if (this.watchProgressCallback) {
					this.watchProgressCallback(cProgress)
				}
			}, async (res) => {
				console.log('上传成功2', res.data.img_url, fileData.uri);

				await this.saveUploadPhotoToLocalCache(res.data.img_url, fileData.uri);
				console.log(fileData);

				if (this.finishBlock) {
					this.finishBlock(res.data)
				}

			}, async (error) => {
				console.log('上传失败', error)
				if (this.finishBlock) {
					this.finishBlock()
				}
			});

		this.xhr = xhr;
		this.formData = formData;
		return this;
	}

	async stopUpload() {
		this.xhr.abort();
		if (this.finishBlock) {
			this.finishBlock()
		}
		delete globalUploadlist[this.taskid]
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

	startUpload() {
		this.xhr.send(this.formData)
	}
}

let globalUploadlist = {};


class UploadList {

	get list() {
		return globalUploadlist
	}

	destructor() {
		console.log('destructor globalUploadlist');
		let keys = Object.keys(this.list);
		for (let key of keys) {
			let task: UploadTask = this.list[key];
			task.stopUpload();
		}
	}

	getTaskWithId(taskid): UploadList {
		if (taskid) {
			return this.list[taskid];
		} else {
			return null;
		}
	}

	createUploadPhotoTask(params = {}, fileData) {

		let url = URLS.SEND_MESSAGE_FILE;
		let task = new UploadTask(url, params, fileData);
		return {task, taskid: task.taskid};
	}

	createUploadPhotoCustomerTask(params = {}, fileData) {
		let url = URLS.UPLOAD_PHOTO;
		let task = new UpLoadTaskCustomer(url, params, fileData);
		return {task, taskid: task.taskid};
	}

	startUploadPhotoTask(task: UploadTask, messageid, photoid) {
		task.messageId = messageid;
		task.photoId = photoid;
		this.list[task.taskid] = task;
		task.startUpload();
	}

	startUploadPhotoTaskCustomer(task: UpLoadTaskCustomer) {
		this.list[task.taskid] = task;
		task.startUpload();
	}
}

exports.UploadList = UploadList;
