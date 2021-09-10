import CustomStorage from "../global/CustomStorage";

class DBVersionService {

    async getDbVersion() {
        // try {
        //     let results = await DBFunction.execute('SELECT * FROM db_version where id = ?', ["1"]);
        //     let dbv = new DBVersionDao(results[0]);
        //     return dbv.version;
		// } catch (e) {
		// 	return '-1'
		// }
		let result = CustomStorage.getItem('dbVersion', 1);
		return result
    }

    async updateDbVersion(version) {
        // await DBFunction.execute('UPDATE `db_version` SET `version` = ? WHERE id = ?;', [version, "1"])
		await CustomStorage.setItem('dbVersion', version);
    }

}
export default DBVersionService;
