export default class DBVersionDao {
    id;
    version;

    constructor(dist) {
        this.id = dist.id;
        this.version = dist.version;
    }

}
