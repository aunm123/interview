'use strict';
import md5 from "md5";
import RNFetchBlob from "rn-fetch-blob";
import GlobalSpace from "../TModal/GlobalSpace";
import CustomStorage from "../global/CustomStorage";

const STORAGE_KEY = 'cache-image-entity';
const TOTAL_DIRECTORYS = 17;
const {fs} = RNFetchBlob;

const config = {
	overwrite: false,
	dirsQuantity: TOTAL_DIRECTORYS
}
const cacheEntity = {
	cacheMap: {},
	latest: false
}

/**
 * 图片存储的基本目录
 * @returns {string}
 */
const getImagesCacheDirectory = () => `${fs.dirs.CacheDir}/cache-images`;


const getEncryptedInfo = fileOriginalName => {
	const filename = md5(fileOriginalName).toString();
	const directory = additiveHash(filename)
	return {filename, directory}
}

/**
 * 加法hash算法
 * @param value md5字符串
 * @returns {number} 获得值为[0, dirsQuantity - 1]
 */
const additiveHash = value => {
	let hash = 0
	const chars = value.match(/./g)
	for (let v of chars) {
		hash += parseInt(`0x${v}`, 16)
	}
	return hash % config.dirsQuantity
}

/**
 * 图片存储临时目录
 * @returns {string}
 */
const getTmpDir = () => `${getImagesCacheDirectory()}/tmp`;

/**
 * get image type
 * @param response
 * @returns {string}
 * @private
 */
const _getImageExtension = (response) => {
	const info = response.info() || {}
	const contentType = info.headers['Content-Type'] || ''
	const matchResult = contentType.match(/image\/(png|jpg|jpeg|bmp|gif|webp|psd);/i)
	return matchResult && matchResult.length >= 2 ? matchResult[1] : 'png'
}

/**
 * move the tmp image file to final local path
 * @param toDir
 * @param from
 * @param to
 * @returns {Promise<boolean>}
 * @private
 */
const _moveImage = async (toDir, from, to) => {
	const exists = await fs.exists(to).catch(e => console.log(e))
	if (exists) {
		if (config.overwrite) {
			await fs.unlink(to)
		} else {
			return true
		}
	}
	const isDir = await fs.isDir(toDir).catch(e => console.log(e))
	if (!isDir) {
		await fs.mkdir(toDir).catch(e => console.log(e))
	}
	await fs.mv(from, to).catch(e => console.log(e))
	return false
}

/**
 * save the pair of original-image-uri and final-cache-path
 * @param originalUri
 * @param cachePath
 * @returns {Promise<void>}
 * @private
 */
const _saveCacheKey = async (originalUri, cachePath) => {
	await _syncStorage2CacheEntity().catch(e => console.log(e))
	const {cacheMap = {}} = cacheEntity
	cacheMap[originalUri] = cachePath
	await _syncCacheEntity2Storage().catch(e => console.log(e))
}

/**
 * sync save CacheEntity to storage
 * @returns {Promise<void>}
 * @private
 */
const _syncCacheEntity2Storage = async () => {
	if (cacheEntity) {
		await CustomStorage.setItem(STORAGE_KEY, JSON.stringify(cacheEntity)).catch(e => console.log(e))
	}
};

/**
 * get the latest CacheEntity
 * @returns {Promise<{update: boolean, map: {}, latest: boolean}>}
 * @private
 */
const _syncStorage2CacheEntity = async () => {
	if (!cacheEntity || !cacheEntity.latest) {
		let entity = await CustomStorage.getItem(STORAGE_KEY).catch(e => console.log(e))
		if (entity) {
			try {
				entity = JSON.parse(entity)
			} catch (e) {
				entity = {}
			}
		} else {
			entity = {}
		}
		Object.assign(cacheEntity, entity, {latest: true})
	}
}
let downloadList = {};


class Download {

	tempFileDirectory = '';
	/**
	 * 监控列表
	 * @type {{}}
	 */
	listenList = {};

	/**
	 * 下载列表
	 * @type {{}}
	 */
	get downloadList() {
		return downloadList;
	}

	/**
	 * 查找缓存文件，没有就下载，有就直接返回地址
	 * @param url
	 * @returns {Promise<{}>}
	 */
	async getFileWithUrl(url) {

		if (!url) return {};
		await _syncStorage2CacheEntity()
		let {cacheMap = {}} = cacheEntity
		let cachePath = cacheMap[url];
		if (cachePath) {
			const exists = await fs.exists(cachePath).catch(e => console.log(e));
			if (exists)
				return {taskId: null, filePath: `file://${cachePath}`}
			else
				return {taskId: this.downloadFile(url), filePath: null}
		}
		return {taskId: this.downloadFile(url), filePath: null}

	}

	/**
	 * 没有缓存文件，下载文件，返回taskid
	 * @returns {string}
	 */
	downloadFile(url) {
		const {filename, directory} = getEncryptedInfo(url);
		const taskId = md5(url);
		const tmpPath = `${getTmpDir()}/${taskId}`

		const task = RNFetchBlob.config({
			path: tmpPath
		}).fetch('GET', url);
		this.downloadList[taskId] = {task: task, url: url};

		return taskId;
	}

	/**
	 * 通过taskID, 监控下载进度, 添加监控人KEY
	 * @param progressBlock
	 */
	listenTaskWithTaskId(taskId, listenerKey, progressBlock) {

		let {task, url} = this.downloadList[taskId];
		this.listenList[listenerKey] = true;
		task.progress((received, total) => {
			let l = this.listenList[listenerKey];
			if (l && progressBlock) {
				progressBlock(received, total);
			}
		})

	}

	async saveCacheKey(url, cachePath) {
		let res = await _saveCacheKey(url, cachePath)
		return res;
	}

	async filePathRand(taskId, url, imageExtension) {
		const {filename, directory} = getEncryptedInfo(url);
		const cacheDir = `${getImagesCacheDirectory()}/${directory}`;
		const cachePath = `${cacheDir}/${filename}.${imageExtension}`;

		const isDir = await fs.isDir(cacheDir).catch(e => console.log(e))
		if (!isDir) {
			await fs.mkdir(cacheDir).catch(e => console.log(e))
		}

		return {cacheDir, cachePath}
	}

	/**
	 * 保存内容到缓存文件夹
	 * @param taskId
	 * @param url
	 * @param response
	 * @returns {string}
	 */
	async saveFileToCache(taskId, url, response) {
		const tmpPath = `${getTmpDir()}/${taskId}`;
		const imageExtension = _getImageExtension(response);
		const {cacheDir, cachePath} = this.filePathRand(taskId, url, imageExtension);
		const existsImage = await _moveImage(cacheDir, tmpPath, cachePath);
		await _saveCacheKey(url, cachePath).catch(e => console.log(e));
		if (existsImage) {
			response.flush()
		}
		return `file://${cachePath}`
	}

	/**
	 * 移除监听者
	 * @param listenerKey
	 */
	removeListenTaskWithListenKey(listenerKey) {
		delete this.listenList[listenerKey];
	}

	/**
	 * 通过taskId 开始下载
	 * @param taskId
	 */
	async startTaskDownload(taskId) {
		let {task, url} = this.downloadList[taskId];
		const response = await task;
		let result = await this.saveFileToCache(taskId, url, response)
		return result;
	}

	/**
	 * 停止taskId 下载
	 * @param taskId
	 */
	stopTaskDownload(taskId) {
		let {task, url} = this.downloadList[taskId];
		task.cancel((err) => {
			console.log(err)
		});
	}

}

export default Download;
