'use strict';
var through = require('through2');

module.exports = function (opt) {

	function doSomething(file, encoding, callback) {

		if (file.isNull()) {
			return callback(null, file);
		}

		if (file.isStream()) {
			return callback(createError(file, 'Streaming not supported'));
		}

		let data = JSON.parse(file.contents.toString('utf-8'));
		let result = data.objects.map((item)=>{
			console.log(item.name);
			delete item['columns'];
			// delete item['rows'];
			delete item['withoutRowId'];
			delete item['database'];
			item['drop'] = 'DROP TABLE IF EXISTS '+ item['name'] +';';
			item['ddl'] = item.ddl.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS');

			let rows = item.rows.map((row)=>{
				let r = row.reduce((res)=>{
					return res + " ? ,"
				}, '');
				r = r.substring(0, r.length-1);
				return {k: 'INSERT INTO `'+ item['name']+'` VALUES ('+r+');', v: row}
			});
			item.rows = rows;

			return item;
		});
		file.contents = Buffer.from(JSON.stringify(result));

		callback(null, file);
	}

	return through.obj(doSomething);
};


async function initColumn(data) {
	new Promise((resolve)=>{
		let r = data
	})
}
