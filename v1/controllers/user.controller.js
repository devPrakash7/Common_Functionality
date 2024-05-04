const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    sendResponse
} = require('../../services/common.service')
const dateFormat = require('../../helper/dateformat.helper');
const User = require('../../models/user.model')
const {
    getUser,
    Usersave,
} = require('../services/user.service');
const Keys = require('../../keys/keys')
const constants = require('../../config/constants')
const {
    JWT_SECRET
} = require('../../keys/keys');
const {
    isValid
} = require('../../services/blackListMail')





exports.addUser = async (req, res, next) => {

    try {

        const reqBody = req.body;
        const UserId = req.user._id;
        const checkMail = await isValid(reqBody.email);

        if (!checkMail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);
        const users = await getUser(UserId);

        if (users.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_user', {}, req.headers.lang);

        const existing_email = await User.findOne({ email: reqBody.email });

        if (existing_email)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.exist_email', {}, req.headers.lang);

        if (reqBody.confirm_password !== reqBody.password)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.password_mismatch', {}, req.headers.lang);

        reqBody.password = await bcrypt.hash(reqBody.password, 10);
        reqBody.confirm_password = await bcrypt.hash(reqBody.confirm_password, 10);
        reqBody.created_at = await dateFormat.set_current_timestamp();
        reqBody.updated_at = await dateFormat.set_current_timestamp();

        reqBody.tempTokens = await jwt.sign({
            data: reqBody.email
        }, JWT_SECRET, {
            expiresIn: constants.URL_EXPIRE_TIME
        })

        reqBody.device_type = (reqBody.device_type) ? reqBody.device_type : null;
        reqBody.device_token = (reqBody.device_token) ? reqBody.device_token : null;

        const user = await Usersave(reqBody);
        const responseData = {
            _id: user._id,
            first_name: user.last_name,
            last_name: user.first_name,
            email: user.email,
            user_type: user.user_type,
            employee_id: user.employee_id,
            joining_date: user.joining_date,
            phone: user.phone,
            company: user.company,
            department: user.department,
            designation: user.designation
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'USER.signUp_success', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(addUser)........", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.logout = async (req, res, next) => {

    try {

        const reqBody = req.user
        let UserData = await User.findById(reqBody._id);

        if (!UserData || (UserData.user_type !== constants.USER_TYPE.USER))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        UserData.tokens = null
        UserData.refresh_tokens = null

        await UserData.save()
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.logout_success', {}, req.headers.lang);

    } catch (err) {
        console.log('err(logout...)', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.login = async (req, res, next) => {

    try {

        const reqBody = req.body
        let user = await User.findByCredentials(reqBody.email, reqBody.password, reqBody.user_type || '2');
        if (user == 1) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.email_not_found', {}, req.headers.lang);
        if (user == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);
        if (user.status == 0) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        if (user.status == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.deactive_account', {}, req.headers.lang);
        if (user.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);

        let newToken = await user.generateAuthToken();
        let refreshToken = await user.generateRefreshToken()

        user.device_type = (reqBody.device_type) ? reqBody.device_type : null
        user.device_token = (reqBody.device_token) ? reqBody.device_token : null
        user.tokens = newToken;
        user.refresh_tokens = refreshToken;
        await user.save();

        const responseData = {
            _id: user._id,
            first_name: user.last_name,
            last_name: user.first_name,
            email: user.email,
            employee_id: user.employee_id,
            joining_date: user.joining_date,
            tokens: user.tokens,
            user_type: user.user_type,
            refresh_tokens: user.refresh_tokens,
            phone: user.phone,
            company: user.company,
            department: user.department,
            designation: user.designation
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.login_success', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(Login).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.generate_auth_tokens = async (req, res, next) => {

    try {

        const refresh_token = req.body.refresh_token
        let user = await User.findOne({ refresh_tokens: refresh_token })

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_token', {}, req.headers.lang);

        let newToken = await user.generateAuthToken();
        let refresh_tokens = await user.generateRefreshToken();
        await user.save();

        let data = {
            user_id: user._id,
            tokens: newToken,
            refresh_tokens: refresh_tokens
        } || {}

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_auth_token', data, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}