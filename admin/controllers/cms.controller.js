const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Keys = require('../../keys/keys')

const {
    sendResponse
} = require('../../services/common.service')
const dateFormat = require('../../helper/dateformat.helper');
const constants = require('../../config/constants');
const Cms = require('../../models/cms.model');
const fs = require('fs');
const fsExtra = require('fs-extra');
const {
    extractDataWithAdmZip,
    compressData
} = require('../../services/compress.service');
const {
    getFilePathWithoutBaseUrl,
    getFilePathWithoutPublic,
    removeFile
} = require('../../helper/commonFunction.helper');
const {
    getListOfFilesOrFolderOfGivenPath
} = require('../../helper/fileSystem.helper');



exports.addCms = async (req, res) => {
    const {
        title,
        slug,
        content
    } = req.body;

    try {
        let lang;

        if (!req.body.lang) {
            lang = constants.DEFAULT_LANGUAGE;
        } else {
            lang = req.body.lang;
        }

        let appLanguage = constants.APP_LANGUAGE;

        let availableLanguage = appLanguage.includes(lang);

        if (!availableLanguage) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.selected_language_not_found');
        }

        const cmsData = new Cms();
        cmsData.title = title;
        cmsData.slug = slug;
        cmsData.lang = lang;
        cmsData.content = content;
        cmsData.created_at = dateFormat.set_current_timestamp();
        cmsData.updated_at = dateFormat.set_current_timestamp();
        const data = await cmsData.save();

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.cms_create_success', data, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//Get cms list
exports.getCmsList = async (req, res) => {
    try {
        let lang;

        if (req.params.lang) {
            lang = req.params.lang;

        } else {
            lang = constants.DEFAULT_LANGUAGE;
        }

        let appLanguage = constants.APP_LANGUAGE;

        let availableLanguage = appLanguage.includes(lang);

        if (!availableLanguage) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.selected_language_not_found', {}, req.headers.lang);
        }

        const sort = {};
        var field, value;
        const search = req.query.q ? req.query.q : ''; // for searching
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            field = parts[0];
            parts[1] === 'desc' ? value = -1 : value = 1;
        } else {
            field = "created_at",
                value = 1;
        }
        const pageOptions = {
            page: parseInt(req.query.page) || constants.PAGE,
            limit: constants.PAGE_DATA_LIMIT
        }
        var query = {
            lang
        }
        if (search) {
            query.$or = [{
                    'title': new RegExp(search, 'i')
                },
                // { 'isActive': new RegExp(search, 'i') }
            ]
        }
        const total = await Cms.countDocuments(query)
        const cmsData = await Cms.find(query)
            .sort({
                [field]: value
            })
            .skip((pageOptions.page - 1) * pageOptions.limit)
            .limit(pageOptions.limit)
            .collation({
                locale: "en"
            })

        let data = {}
        data.cmsData = cmsData;
        data.total = total;
        data.per_page = pageOptions.limit;
        data.current_page = pageOptions.page;

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.cms_get_success', data, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//Get single cms list
exports.getSingleCms = async (req, res) => {
    try {
        let _id = req.params.cmsId;
        const cmsData = await Cms.findOne({
            _id
        }).lean();


        cmsData.contant_link = (cmsData.static_path) ? Keys.BASEURL + cmsData.static_path +"/" : null
        cmsData.file_link = (cmsData.content) ? Keys.BASEURL + "v1/cms/" + cmsData.slug :null

        delete cmsData.static_backup_path;
        delete cmsData.static_path;

        if (!cmsData) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'ADMIN.cms_not_found', {}, req.headers.lang);
        }

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.cms_get_success', cmsData, req.headers.lang);
        // logService.responseData(req, cmsData);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}
//Edit cms 
exports.updateCms = async (req, res) => {
    try {
        let reqdata = req.body
        let id = reqdata.cmsId;
        let appLanguage = constants.APP_LANGUAGE;
        const cmsData = await Cms.findOne({
            _id: id
        });

        if (!cmsData) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'ADMIN.cms_not_found', {}, req.headers.lang);
        }

        if (reqdata.title) {
            var cmsTitleExist = await Cms.findOne({
                title: reqdata.title,
                _id: {
                    $ne: id
                },
                lang: {
                    $nin: appLanguage
                }
            });

            if (cmsTitleExist) {
                return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.cms_title_exist', {}, req.headers.lang);
            } else {
                cmsData.title = reqdata.title;
            }
        }

        if (reqdata.slug) {
            var cmsSlugExist = await Cms.findOne({
                slug: reqdata.slug,
                _id: {
                    $ne: id
                },
                lang: {
                    $nin: appLanguage
                }
            });

            if (cmsSlugExist) {
                return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.cms_slug_exist', {}, req.headers.lang);
            } else {
                cmsData.slug = reqdata.slug;
            }
        }

        if (reqdata.content) {
            cmsData.content = reqdata.content;
        }

        cmsData.file_type = 1
        cmsData.updated_at = dateFormat.set_current_timestamp();
        const data = await cmsData.save();

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.cms_update_success', data, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.uploadCms = async (req, res) => {

    req.setTimeout(0);
    // if(req.file === undefined){
    //     return res.status(500).send({
    //         status:constants.STATUS_CODE.FAIL,
    //         message: Lang.responseIn("USER.VALID_ZIP_FILE", req.headers.lang),
    //         error:true,
    //         data:{}
    //     })
    // }

    if (req.file === undefined) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.valid_zip_file', {});


    let filePath = req.file.path;
    let static_backup_path = null;
    let slugPath = null;
    let fileBackUpDestinationPath = null;
    let publicStaticBackUpPath = null;
    let current_time = await dateFormat.set_current_timestamp()
    try {

        console.log("filePath.....", filePath)
        let reqdata = req.body
        let id = req.params.cmsId;
        let compressStatus = null;

        const cmsData = await Cms.findOne({
            _id: id
        });
        // if(!cmsData){
        //     return res.status(404).send({
        //         status: constants.STATUS_CODE.FAIL,
        //         message: Lang.responseIn("CMS.CMS_NOT_FOUND", req.headers.lang),
        //         error: true,
        //         data: {},
        //     });
        // }

        console.log("cmsData....", cmsData)

        if (!cmsData) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.cms_not_found', {});

        let slug = cmsData.slug;
        let lang = cmsData.lang;
        static_backup_path = cmsData.static_backup_path;
        let zipFileName = slug + '_' + lang + '_' + current_time + '.zip';

        if (static_backup_path) {
            publicStaticBackUpPath = await getFilePathWithoutBaseUrl(static_backup_path);
        }

        let fileBackUpPath = constants.PATH.CMS_BACKUP_PATH + '/' + slug;
        if (!fs.existsSync(fileBackUpPath)) {
            fs.mkdirSync(fileBackUpPath);
        }
        fileBackUpDestinationPath = fileBackUpPath + '/' + zipFileName;

        slugPath = constants.PATH.PUBLIC_CMS_PATH + '/' + slug + '/' + lang;

        if (!fs.existsSync(slugPath)) {
            fs.mkdirSync(slugPath, {
                recursive: true
            });
        }

        await fsExtra.emptyDirSync(slugPath)

        await extractDataWithAdmZip(filePath, slugPath)

        let extractedFileList = await getListOfFilesOrFolderOfGivenPath(slugPath, constants.FS_TYPES.FILE)

        console.log("extractedFileList....", extractedFileList)

        // if(!extractedFileList.includes("index.html")){
        //     console.log("filePath..yes.." )
        //     throw Lang.sendCustomException(
        //         "CMS.INDEX_FILE_NOT_FOUND",
        //         constants.ERROR_OBJECT.CUSTOM_ERROR,
        //         400
        //     )
        // }

        if (!extractedFileList.includes('index.html')) {
            console.log("yes")
        } else {
            console.log("no...")
        }

        if (!extractedFileList.includes('index.html')) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.index_file_not_found', {});

        if (!extractedFileList.includes('index.html')) {
            console.log("yes")
        } else {
            console.log("no...")
        }

        console.log("slugPath, fileBackUpDestinationPath", slugPath, fileBackUpDestinationPath)

        compressStatus = await compressData(slugPath, fileBackUpDestinationPath)

        console.log("compressStatus...>>>..", compressStatus)

        // if(compressStatus == null){
        //     throw Lang.sendCustomException(
        //         "CMS.BACKUP_ERROR",
        //         constants.ERROR_OBJECT.CUSTOM_ERROR,
        //         400
        //     )
        // }

        if (compressStatus == null) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.cms_backup_error', {});

        let cmsUpdatedData = await Cms.findOneAndUpdate({
            _id: id
        }, {
            static_path: await getFilePathWithoutPublic(slugPath),
            static_backup_path: await getFilePathWithoutPublic(fileBackUpDestinationPath),
            file_type: 2
        })

        console.log("cmsUpdatedData....", cmsUpdatedData)

        await removeFile(publicStaticBackUpPath);

        // res.status(200).send({
        //     status: constants.STATUS_CODE.SUCCESS,
        //     message: Lang.responseIn("CMS.CMS_UPLOAD_SUCCESS", req.headers.lang),
        //     error: false,
        //     data: {}
        // });

        console.log("*******************")

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.cms_upload_success', {}, req.headers.lang);



    } catch (error) {
        console.log("error>>>>>>>>>>>>>>>>>>.", error)
        let message = null;
        let errorCode = null;
        if (error.metaData != undefined) {
            message = Lang.responseIn(error.message, req.headers.lang);
            errorCode = error.customErrorCode;
        } else {
            message = Lang.responseIn('GENERAL.GENERAL_CATCH_MESSAGE', req.headers.lang);
            errorCode = 400;
        }

        await fsExtra.emptyDirSync(slugPath)
        if (publicStaticBackUpPath != null && fs.existsSync(publicStaticBackUpPath)) {
            await extractDataWithAdmZip(publicStaticBackUpPath, slugPath)
        }

        // res.status(errorCode).send({
        //     status: constants.STATUS_CODE.FAIL,
        //     message: message,
        //     error: true,
        //     data: {},
        // });

        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)

    } finally {
        await removeFile(filePath);
    }

}



exports.changeFileType = async (req, res) => {
    try {
        let reqdata = req.body
        let id = reqdata.cmsId;
        let appLanguage = constants.APP_LANGUAGE;
        const cmsData = await Cms.findOne({
            _id: id
        });

        if (!cmsData) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'ADMIN.cms_not_found', {}, req.headers.lang);
        }

        cmsData.file_type = reqdata.file_type
        cmsData.updated_at = dateFormat.set_current_timestamp();
        const data = await cmsData.save();

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.cms_update_success', data, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}