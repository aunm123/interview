import AutoSave from "../TModal/AutoSave";
import Global from "../mobx/Global";

export default class ContactPhoneDao {
    id;
    country_no;
    phone_no;
    type;
    contact_no;
    userid;

    @AutoSave
    global: Global;

    constructor(dist) {
        if (dist) {
            this.id = dist.id;
            this.country_no = dist.country_no;
            this.phone_no = dist.phone_no;
            this.type = dist.type;
            this.contact_no = dist.contact_no;
        }

        if (this.global.hasLogin) {
            this.userid = this.global.userid;
        }
    }
}
