import AutoSave from "../TModal/AutoSave";
import Global from "../mobx/Global";
import DBFunction from "../global/DBFunction";
import Util from "../global/Util";
import AppStore from "../mobx/AppStore";
import HistoryDao from "../dao/HistoryDao";

class RecentService {

    @AutoSave
    global: Global;
    @AutoSave
    appStore: AppStore;

    async updateLastRecentList(lastMessageList) {

        let index = 0;
        for (let item of lastMessageList) {

            let message_id = item.id;
            let targetPhone = item.targetPhone;

            let res = await DBFunction.execute('SELECT `targetPhone` FROM `recent` WHERE `targetPhone` = ? AND  `userid` = ?',
                [targetPhone, this.global.userid]);

            if (res.length <= 0) {
                await DBFunction.execute('INSERT INTO `recent` (`targetPhone`, `message_id`, `userid`, `index`) VALUES ( ? , ? , ? , ?);',
                    [targetPhone, message_id, this.global.userid, 99]);
            }

            index++;
        }
        let res = await DBFunction.execute('SELECT `targetPhone`, `message_id` FROM `recent` WHERE `userid` = ?',
            [this.global.userid]);

        let c = [];
        for (let item of res) {
            let ko = true;
            for (let lm of lastMessageList) {
                if (lm.targetPhone == item.targetPhone) {
                    ko = false;
                }
            }
            if (ko) {
                c.push(item);
            }
        }

        let end = [];
        for (let item of c) {
            let targetPhone = item.targetPhone;

            let phone = Util.fixNumber(targetPhone);
            let contract = this.appStore.finListAllContent2(phone, false);
            let temp = {
                country_no: phone.country_no,
                phone_no: phone.phone_no,
                content: "",
                date: "",
                fromphone: targetPhone,
                isread: 1,
                state: 2,
                time: 0,
                tophone: "me",
                type: 0,
                userid: this.global.userid,
            };
            let value = {...contract, ...temp, targetPhone: targetPhone};
            end.push(value);
        }

        return this.sortRowHistory([...lastMessageList, ...end]);
    }

    async sortRowHistory(lastMessageList) {

        let res = await DBFunction.execute('SELECT `targetPhone`, `index` FROM `recent` WHERE `userid` = ? ORDER BY `index` ASC',
            [this.global.userid]);
        let result = [];

        for (let item of res) {
            for (let jtem of lastMessageList) {
                if (jtem.targetPhone == item.targetPhone) {
                    result.push(jtem);
                    break;
                }
            }
        }

        return result;
    }

    async setFirstRowHistory(history: HistoryDao) {
        let phoneNum = '';
        if (history.fromphone == 'me') {
            // 本机打出去的信息
            phoneNum = history.tophone;
        } else {
            // 别人打进来的信息
            phoneNum = history.fromphone;
        }

        let res = await DBFunction.execute('SELECT `targetPhone` FROM `recent` WHERE `targetPhone` = ? AND  `userid` = ?',
            [phoneNum, this.global.userid]);

        if (res.length <= 0) {
            await DBFunction.execute('INSERT INTO `recent` (`targetPhone`, `message_id`, `userid`, `index`) VALUES ( ? , ? , ? , ?);',
                [phoneNum, history.id, this.global.userid, 0]);
        } else {
            await DBFunction.execute('UPDATE `recent` SET `message_id` = ?, `index` = ? WHERE `targetPhone` = ? AND `userid` = ?;',
                [history.id, 0, phoneNum, this.global.userid]);
        }
        // 其他 index + 1
        await DBFunction.execute('UPDATE `recent` SET `index` = `index` + 1 WHERE `targetPhone` != ? AND `userid` = ?;',
            [phoneNum, this.global.userid]);

    }


    async deleteByPhone(phone) {
        await DBFunction.execute('DELETE FROM `recent` WHERE `targetPhone` = ? AND `userid` = ?;',
            [phone, this.global.userid]);
    }

}

export default RecentService;
