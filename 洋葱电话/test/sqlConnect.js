'use strict';
let bell = null;
let ban = 0;

// let sqls = [];
// let params = [];
// if (bell != null) {
// 	sqls.push(" `bell` = ? ");
// 	params.push(bell.toString());
// }
// if (ban != null) {
// 	sqls.push(" `ban` = ? ");
// 	params.push(bell.toString());
// }
//
// let sqlStr = sqls.join(",");
// sqlStr = 'UPDATE `config` SET ' + sqlStr + ' WHERE `key` = ? AND `userid` = ? ;';
//
// console.log(sqlStr);


// INSERT INTO `config` (`small_url`, `big_url`, `width`, `height`, `filename`, `filetype`, `userid`) VALUES ( ? , ? , ? , ? , ? , ?, ? );

// let sqls = [' `key`, `userid`'];
// let sqlValue = [' ?', ' ?'];
// let params = ['asdasoidjasidj', "asdasdasd"];
// if (bell != null) {
// 	sqls.push(" `bell`");
// 	sqlValue.push(" ?");
// 	params.push(bell.toString());
// }
// if (ban != null) {
// 	sqls.push(" `ban`");
// 	sqlValue.push(" ?");
// 	params.push(ban.toString());
// }
//
// let sqlStr = sqls.join(",");
// let sqlValueStr = sqlValue.join(",");
// sqlStr = 'INSERT INTO `config` (' + sqlStr + ') VALUES ('+ sqlValueStr +' )';
//
// console.log(sqlStr);

let k = 1;
let m = 0;

let ar = [1,1,1,0,0];
for (let i of ar) {
	k = k && i;
	m = m || i;
}

console.log(k, m);
