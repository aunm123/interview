'use strict';
import AutoSave from "../TModal/AutoSave";
import Global from "../mobx/Global";

export default class ConfigDao {
	id;
	key;
	bell;
	ban;
	userid;

	@AutoSave
	global: Global;

	constructor(dist) {

		if (dist) {
			this.id = dist.id;
			this.key = dist.key;
			this.bell = dist.bell;
			this.ban = dist.ban;
		}

		if (this.global.hasLogin) {
			this.userid = this.global.userid;
		}
	}
}
