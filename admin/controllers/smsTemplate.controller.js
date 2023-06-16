const SMSFormat = require('../../models/smsTemplate.model');
const dateFormat = require('../../helper/dateformat.helper');
const constants = require('../../config/constants');
const { sendResponse } = require('../../services/common.service');

//create SMS template
exports.createSMSTemplate = async (req, res) => {

    try {
        let reqdata = req.body;

        var smsTemplateTitle = (reqdata.title).trim()
        var regex = new RegExp('^' + smsTemplateTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        var isTemplateExist = await SMSFormat.findOne({ title: { $regex: regex } });

        if (isTemplateExist) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'SMS.title_already_exists', {}, req.headers.lang);

        var getId = await SMSFormat.aggregate([{ $group: { _id: null, id_max: { $max: "$id" } } }]);
        if (getId.length <= 0) {
            var id = 0;
        } else {
            var id = getId[0].id_max + 1;
        }

        smsTemplate = new SMSFormat();
        smsTemplate.id = id;
        smsTemplate.title = reqdata.title;
        smsTemplate.keys = reqdata.keys;
        smsTemplate.subject = reqdata.subject;
        smsTemplate.body = reqdata.body;
        smsTemplate.status = reqdata.status;
        smsTemplate.created_at = await dateFormat.set_current_timestamp();
        smsTemplate.updated_at = await dateFormat.set_current_timestamp();

        let smsTemplateData = await smsTemplate.save();

        sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'SMS.sms_format_created_success', smsTemplateData, req.headers.lang);
        // logService.responseData(req, smsTemplateData);

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}
//get single SMS Template
exports.getSingleSMSTemplate = async (req, res) => {

    try {
        SMSTemplate = await SMSFormat.findById(req.params.id)

        if (!SMSTemplate) {
            sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'SMS.no_sms_format_exists', {}, req.headers.lang);
        } else {
            sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'SMS.sms_template_retrieve', SMSTemplate, req.headers.lang);
        }

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//get all SMS Templates
exports.getAllSMSTemplate = async (req, res) => {

    try {
        SMSTemplateData = await SMSFormat.find()

        if (SMSTemplateData.length <= 0) {
            sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'SMS.no_sms_format_exists', {}, req.headers.lang);
        } else {
            sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'SMS.sms_template_retrieve', SMSTemplateData, req.headers.lang);
        }

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//update SMS template
exports.updateSMSTemplate = async (req, res) => {

    try {
        let reqdata = req.body;

        smsFormatData = await SMSFormat.findById(req.params.id)
        if (!smsFormatData) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'SMS.no_sms_format_exists', {}, req.headers.lang);

        var smsTemplateTitle = (reqdata.title).trim()
        var regex = new RegExp('^' + smsTemplateTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        var isTemplateTitle = await SMSFormat.findOne({
            title: { $regex: regex }, _id: {
                $ne: req.params.id
            },
        });

        if (isTemplateTitle) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'SMS.title_already_exists', {}, req.headers.lang);

        smsFormatData.title = reqdata.title;
        smsFormatData.keys = reqdata.keys;
        smsFormatData.subject = reqdata.subject;
        smsFormatData.body = reqdata.body;
        smsFormatData.status = reqdata.status;
        smsFormatData.created_at = dateFormat.set_current_timestamp();
        smsFormatData.updated_at = dateFormat.set_current_timestamp();

        let updatedSMSFormatData = await smsFormatData.save();

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'SMS.sms_format_updated_success', updatedSMSFormatData, req.headers.lang);

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//delete SMS Template
exports.deleteSMSTemplate = async (req, res) => {

    try {
        DeletedSMSTemplate = await SMSFormat.findByIdAndDelete(req.params.id)

        if (!DeletedSMSTemplate) {
            sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'SMS.no_sms_format_exists', {}, req.headers.lang);
        } else {
            sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'SMS.sms_template_deleted', DeletedSMSTemplate, req.headers.lang);
        }

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}