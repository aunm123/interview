import DBFunction from "../global/DBFunction";
import AutoSave from "../TModal/AutoSave";
import AppStore from "../mobx/AppStore";
import ContactDao from "../dao/ContactDao";
import ContactPhoneDao from "../dao/ContactPhoneDao";
import Global from "../mobx/Global";

class ContractService {

    @AutoSave
    appstore: AppStore;

    @AutoSave
    global: Global;

    async getALLContactData() {
        return DBFunction.execute('SELECT * FROM `contact` ORDER BY `name` WHERE `userid` = ? ;', [this.global.userid]);
    }
    async getALLContactDataWithKey(key) {
        let likeKey = '%' + key + '%';
        return DBFunction.execute('SELECT * FROM `contact` WHERE `name` like ? AND `userid` = ? ;', [likeKey, this.global.userid]);
    }

    async cleanContent(){
        this.appstore.intelContent = [];
        await DBFunction.execute('DELETE FROM `contact` WHERE `userid` = ? ;', [this.global.userid]);
        await DBFunction.execute('DELETE FROM `contact_phone` WHERE `userid` = ? ;', [this.global.userid]);
    }


    async insertContent(item) {
        let contract = new ContactDao();
        contract.id = item.id;
        contract.name = item.cname;
        return DBFunction.execute('INSERT INTO `contact` (`id`, `name`, `userid`) VALUES ( ? , ? , ?);',
            [contract.id, contract.name, contract.userid])
    }

    async inserContentPhone(id, phone) {
        let cphone = new ContactPhoneDao();
        cphone.country_no = phone.country_no;
        cphone.phone_no = phone.phone_no;
        cphone.type = phone.type;

        return DBFunction.execute('INSERT INTO `contact_phone` (`country_no`, `phone_no`, `type`, `contact_no`, `userid`) VALUES ( ? , ? , ? , ? , ?);',
            [cphone.country_no, cphone.phone_no, cphone.type, id, cphone.userid])
    }

    async deleteContent(id) {
        await DBFunction.execute('DELETE FROM `contact` WHERE `id` = ? AND `userid` = ? ;', [id, this.global.userid]);
        await DBFunction.execute('DELETE FROM `contact_phone` WHERE `contact_no` = ? AND `userid` = ? ;', [id, this.global.userid]);
    }

}
export default ContractService;
