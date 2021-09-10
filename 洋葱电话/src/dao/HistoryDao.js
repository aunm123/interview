import AutoSave from "../TModal/AutoSave";
import Global from "../mobx/Global";

export default class HistoryDao {
    id;
    date;
    state;
    type;
    content;
    tophone;
    fromphone;
    time;
    isread;
    index; // 唯一健
    userid;

    @AutoSave
    global: Global;

    constructor(dist) {
        if (dist){
            this.id = dist.id;
            this.date = dist.date;
            this.state = dist.state;
            this.type = dist.type;
            this.content = dist.content;
            this.tophone = dist.tophone;
            this.fromphone = dist.fromphone;
            this.time = dist.time;
            this.isread = dist.isread;
            this.index = dist.index;
        }

        if (this.global.hasLogin) {
            this.userid = this.global.userid;
        }

    }
}
