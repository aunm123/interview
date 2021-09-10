import AutoSave from "../TModal/AutoSave";
import Global from "../mobx/Global";

export default class PhotoDao {
	id;
	big_url;
	small_url;
	width;
	height;
	filename;
	filetype;
	isUpload;
	userid;

	@AutoSave
	global: Global;

	constructor(dist) {
		if (dist){
			this.id = dist.id;
			this.big_url = dist.big_url;
			this.small_url = dist.small_url;
			this.width = dist.width;
			this.height = dist.height;
			this.isUpload = dist.isUpload;
			this.filename = dist.filename;
			this.filetype = dist.filetype;

		}

		if (this.global.hasLogin) {
			this.userid = this.global.userid;
		}
	}
}
