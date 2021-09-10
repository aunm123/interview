import DBFunction from "../global/DBFunction";
import Util from "../global/Util";
import moment from "moment";
import AutoSave from "../TModal/AutoSave";
import Global from "../mobx/Global";
import AppStore from "../mobx/AppStore";
import MessageService from "./MessageService";

class PhoneService {

    @AutoSave
    appStore: AppStore;
    @AutoSave
    global: Global;
    @AutoSave
    messageService: MessageService;

    async getPhoneHistory() {
        let rsu = [];
        let phoneSet = {};
        let phone_number = 'me';
        // let res = await DBFunction.execute('SELECT * FROM history WHERE (`tophone` = ? OR `fromphone` = ? ) ' +
        //     '`type` = ? GROUP BY `tophone`, `fromphone` ORDER BY `date` DESC', [phone_number, phone_number, 1]);

        let res = await DBFunction.execute('SELECT * FROM `history` WHERE `type` = ? AND `userid` = ? ORDER BY `date` DESC', [1, this.global.userid]);
        for (let item of res){
            if (item.fromphone == 'service') continue;
            let targetPhone = {};
            let phoneNum = '';
            let key = '';
            if (item.fromphone == phone_number){
                // 本机打出去的电话
                targetPhone = Util.fixNumber(item.tophone);
                phoneNum = item.tophone;
                key = item.fromphone + item.tophone;
            }else {
                // 别人打进来的电话
                targetPhone =  Util.fixNumber(item.fromphone);
                phoneNum = item.fromphone;
                key = item.tophone + item.fromphone;
            }
            await this.appStore.updateUnknowPhone();
            let contract = this.appStore.finListAllContent2(targetPhone, false);
            let value = {...contract, ...item};
            let oldValue = phoneSet[key];
            if (oldValue){
                let oldvalue_time = moment(oldValue.date);
                let newvalue_time = moment(item.date);
                let t = newvalue_time.diff(moment(oldvalue_time), 'seconds');
                if (t>0){
                    phoneSet[key] = value;
                }
            } else {
                phoneSet[key] = value;
            }
        }
        // 打进来和打出去的号码统一 用一个表示
        let keys = Object.keys(phoneSet);
        for (let key of keys) {
            rsu.push(phoneSet[key]);
        }

        return rsu;
    }

    async insertCallHistory(item) {
        let params = {
            state: 1,
            type: 1,
            toPhone: item.toPhone,
            fromPhone: item.fromPhone,
            isread: item.isread,
        };
        let time = moment(new Date()).utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
        let r = await DBFunction.execute('INSERT INTO `history` (`date`, `state`, `type`, `tophone`, `fromphone`, `userid`) ' +
            'VALUES ( ? , ? , ? , ? , ?, ?);',
            [time, params.state, params.type, params.toPhone, params.fromPhone, this.global.userid]);

        // 更新最近电话
        await this.appStore.updateMessage();

        return r;
    }

    async updateCallHistoryState(lparams) {
        await DBFunction.execute('UPDATE `history` SET `state` = ? WHERE `id` = ? AND `userid` = ? ;',
            [ lparams.state, lparams.id, this.global.userid]);

        // 更新最近电话
        await this.appStore.updateMessage()
    }

    async updateCallHistoryTime(lparams) {
        await DBFunction.execute('UPDATE `history` SET `time` = ? WHERE `id` = ? AND `userid` = ? ;',
            [ lparams.time, lparams.id, this.global.userid]);

        // 更新最近电话
        await this.appStore.updateMessage()
    }

}

export default PhoneService
