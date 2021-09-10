export default class CountryDao {
    id;
    country_en;
    country_cn;
    country_code;
    continent;
    country_no;
    status;


    constructor(dist){
        this.id = dist.id;
        this.country_en = dist.country_en;
        this.country_cn = dist.country_cn;
        this.country_code = dist.country_code;
        this.continent = dist.continent;
        this.country_no = dist.country_no;
        this.status = dist.status;
    }
}
