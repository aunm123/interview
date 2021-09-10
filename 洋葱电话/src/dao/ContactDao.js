import AutoSave from "../TModal/AutoSave";
import Global from "../mobx/Global";

export default class ContactDao {
    id;
    name;
    icon;
    userid;

    @AutoSave
    global: Global;

    constructor(dist) {

        if (dist) {
            this.id = dist.id;
            this.name = dist.name;
            this.icon = dist.icon;
        }

        if (this.global.hasLogin) {
            this.userid = this.global.userid;
        }
    }
}
