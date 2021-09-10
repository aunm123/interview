import DBFunction from "../global/DBFunction";
import PhotoDao from "../dao/PhotoDao";
import AutoSave from "../TModal/AutoSave";
import Global from "../mobx/Global";



class PhotoService {

    @AutoSave
    global: Global;

    async insertPhoto(photo: PhotoDao) {
        return DBFunction.execute('INSERT INTO `photo` (`small_url`, `big_url`, `width`, `height`, `filename`, `filetype`, `userid`) VALUES ( ? , ? , ? , ? , ? , ?, ? );',
            [photo.small_url, photo.big_url, photo.width, photo.height, photo.filename, photo.filetype, this.global.userid])
    }

    async getPhotoById(id) {
        let result = await DBFunction.execute('SELECT * FROM `photo` WHERE id = ? AND `userid` = ? ;', [id, this.global.userid]);
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    }

    /**
     * 更新图片信息
     * @param params
     * @returns {Promise<void>}
     */
    updatePhotoParams(params: PhotoDao){
        return DBFunction.execute('UPDATE `photo` SET `small_url` = ?, `big_url` = ? , `isUpload` = ? WHERE id = ? AND `userid` = ? ;',
            [params.small_url, params.big_url, params.isUpload, params.id, this.global.userid]);
    }

}
export default PhotoService;
