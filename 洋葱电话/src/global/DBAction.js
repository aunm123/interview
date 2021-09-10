'use strict';
import SQLite from 'react-native-sqlite-storage'
import data from '../assets/db/main'
import Util from "./Util";
import DBFunction from "./DBFunction";
import AutoSave from "../TModal/AutoSave";

let db_Version = 14;

const dbname = "locall";

class DBACtion {

	@AutoSave
	dbVersionService;
	@AutoSave
	appStore;
	@AutoSave
	global;

	isOpening = false;


	async initLocalDB() {

		do {
			try {
				DBFunction.db = await this.openDB();
				console.log("Database OPENED");
			} catch (e) {
				await this.initLocalDB();
				return;
			}
		} while (!this.isOpening);

		await this.checkVersion();
		// await this.initTable();
	}

	async openDB() {
		return new Promise(((resolve, reject) => {
			let db = SQLite.openDatabase(
				{name: dbname, location: 'default'}
				, () => {
					this.isOpening = true;
					resolve(db);
				}, (err) => {
					console.log("SQL Error: " + err);
					this.isOpening = false;
					reject(db);
				});
		}))
	}

	async initTable() {
		for (const item of data) {
			console.log("清理table:", item.name);
			await DBFunction.execute(item.drop, []);
			console.log('创建table:', item.name);
			await DBFunction.execute(item.ddl, []);
			console.log('添加数据:', item.name);
			for (const row of item.rows) {
				await DBFunction.execute(row.k, row.v).then()
			}
		}
		await this.UpdateDBVersion()
	}

	async cleanTable() {
		for (const item of data) {
			console.log("清理table:", item.name);
			await DBFunction.execute(item.drop, []);
			console.log('创建table:', item.name);
			await DBFunction.execute(item.ddl, []);
			console.log('添加数据:', item.name);
			for (const row of item.rows) {
				await DBFunction.execute(row.k, row.v).then()
			}
		}
	}

	async checkVersion() {
		let version = await this.dbVersionService.getDbVersion();
		console.log("数据库本地版本：" + version, "数据库最新版本" + db_Version);
		if (version !== db_Version) {
			await this.initTable();
		}
	}

	async UpdateDBVersion() {
		await this.dbVersionService.updateDbVersion(db_Version);
	}


	async findAllUnknowPhoneNo() {
		let result = [];
		let res = await DBFunction.execute('SELECT * FROM history WHERE (`tophone` = ? OR `fromphone` = ? ) ' +
			'GROUP BY `tophone`, `fromphone` ORDER BY `date` DESC', ['me', 'me']);
		for (let item of res) {
			if (item.fromphone == 'service') continue;
			let targetPhone = {};
			let phoneNum = '';
			if (item.fromphone === 'me') {
				// 本机打出去的电话
				phoneNum = item.tophone;
			} else {
				// 别人打进来的电话
				phoneNum = item.fromphone;
			}
			let {country_no, phone_no} = Util.fixNumber(phoneNum);
			let contract = this.appStore.finListAllContent3({country_no, phone_no}, false);
			if (!contract) {
				result.push({
					name: phoneNum,
					contractType: 2,
					phones: [
						{label: '', number: targetPhone, type: 0, country_no: country_no, phone_no: phone_no}
					]
				})

			}
		}
		return result;
	}

	async selectCountryName(country_no) {
		let result = [];
		let res = await DBFunction.execute('SELECT * FROM `wold_country` where `country_no` = ? ', [country_no]);
		for (let item of res) {
			result = item;
		}
		return result;
	}

	async getAllCountry() {
		let result = [];
		let res = await DBFunction.execute('SELECT * FROM `wold_country` ', []);
		for (let item of res) {
			result.push(item);
		}
		return result;
	}

}

export default DBACtion;
