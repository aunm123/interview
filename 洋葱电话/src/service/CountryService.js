import CountryDao from "../dao/CountryDao";
import DBFunction from "../global/DBFunction";

class CountryService {

    async getCountryData() {
        let rk = [];
        let result = await DBFunction.execute('SELECT * FROM wold_country;', []);
        for (let r of result) {
            let country = new CountryDao(r);
            rk.push(country);
        }
        return rk;
    }

    async findCountryWithKey(key) {
        if (key.substring(0, 1) == '+') {
            key = key.substring(1, key.length);
        }
        let likeKey = '%' + key + '%';
        let rk = [];
        let result = await DBFunction.execute('SELECT * FROM wold_country WHERE country_no like ? OR country_en like ? OR country_cn like ? ;',
            [likeKey, likeKey, likeKey]);

        for (let r of result) {
            let country = new CountryDao(r);
            rk.push(country);
        }
        return rk;
    }

    async getCountryWithCountry_code(code) {
        let result = await DBFunction.execute('SELECT * FROM wold_country WHERE country_code = ? ',
            [code]);
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    }

}
export default CountryService;
