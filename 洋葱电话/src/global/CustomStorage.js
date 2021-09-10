'use strict';
import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-community/async-storage';


class CustomStorage {
	constructor() {
		this.storage = new Storage({
			size: 1000,
			storageBackend: AsyncStorage,
			defaultExpires: null,
			enableCache: true,
		})
	}

	setItem(key, value) : Promise{
		return this.storage.save({
			key: key,
			data: value,
		})
	}

	async getItem(key, defaultValue = null) : Promise{
		let result = defaultValue;
		try {
			result = await this.storage.load({ key: key })
		} catch (e) {
			result = defaultValue;
		}
		return result;
	}

	removeItem(key) : Promise {
		return this.storage.remove({key: key});
	}
}

export default new CustomStorage();
