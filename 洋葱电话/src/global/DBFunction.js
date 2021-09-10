'use strict';

class DBFunction {

	db = null;

	execute(sql, args) {
		let params = [];
		args.map((item)=>{
			let r = '';
			try {
				r = item.toString();
				params.push(r)
			} catch (e) {
			}
		});
		return this._execute(sql, params);
	}

	_execute(sql, args) {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					sql, args, (tx, results) => {
						if (resolve) {
							if (sql.startsWith('INSERT')) {
								resolve({insertId: results.insertId});
								return ;
							}
							let r = [];
							let len = results.rows.length;
							for (let i = 0; i < len; i++) {
								let row = results.rows.item(i);
								r.push(row);
							}
							resolve(r);
						}
					}, (error) => {
						if (reject){
							reject(sql, error);
						}
						console.log(sql, ...args, error)
					});
			});
		})
	}
}

export default new DBFunction();
