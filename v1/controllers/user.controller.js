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
const { add_new_user, login_response } = require('../../reponseData/user.reponse')
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

        if (!user.validPassword(reqBody.password))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_username_password', {}, req.headers.lang);

        if (!user.validPassword(reqBody.confirm_password))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_username_password', {}, req.headers.lang);

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
        let UserData = await User.findById(reqBody._id)
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

        await user.save()
        let responseData = await login_response(user)

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.login_success', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(Login).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.forgotPassword = async (req, res, next) => {
    try {

        const reqBody = req.body
        let existingUser = await getUser(reqBody.email, 'email');

        if (!existingUser) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'USER.email_not_found', {}, req.headers.lang);
        }

        let updated_at = await dateFormat.set_current_timestamp();
        reset_password_token = await jwt.sign({
            data: reqBody.email
        }, JWT_SECRET, {
            expiresIn: constants.URL_EXPIRE_TIME
        })

        // let tempTokens = Math.floor(Math.random() * 10000000)
        let updateData = {
            updated_at: updated_at,
            reset_password_token: reset_password_token
        }


        let conditionData = {
            email: reqBody.email
        }

        const user = await updateUser(conditionData, updateData);

        let sendMail = {
            'to': reqBody.email,
            'lang': existingUser.lang,
            'templateSlug': constants.EMAIL_TEMPLATE.PASSWORD_RESET,
            'data': {
                userName: existingUser.first_name,
                url: Keys.BASEURL + 'v1/web/reset-password?token=' + reset_password_token
            }
        }

        let isSendEmail = await sendEmail(req, sendMail);
        if (isSendEmail) {
            console.log('email has been sent');
        } else {
            console.log('email has not been sent');
        }

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.forgotPassword_email_success', user, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.changePassword = async (req, res, next) => {
    try {

        const reqBody = req.body

        if (reqBody.new_password !== reqBody.confirm_password) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.password_mismatch', {}, req.headers.lang)

        let userDetails = await User.findById(req.user._id);

        if (!userDetails.validPassword(reqBody.old_password)) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalidOldPassword', {}, req.headers.lang)

        userDetails.password = await bcrypt.hash(reqBody.new_password, 10);
        userDetails.updated_at = await dateFormat.set_current_timestamp();

        const changePassword = updateUser({
            _id: userDetails._id
        }, userDetails)

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.passwordUpdate_success', changePassword, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.resetPassword = async (req, res, next) => {

    try {

        const reqBody = req.body

        if (reqBody.new_password !== reqBody.confirm_password) {

            message = req.flash(
                'error',
                'New password and confirm password not matched.'
            );

            return res.redirect(
                Keys.BASEURL + 'v1/web/reset-password?token=' + reqBody.reset_password_token
            );
        }


        let userDetails = await getUser(reqBody.reset_password_token, "reset_password_token");

        if (!userDetails) {
            message = req.flash(
                'error',
                'Your account verify link expire or invalid.'
            );

            return res.render('message', {
                req: req,
                logoUrl: Keys.BASEURL + `images/logo/logo.png`,
                appBaseUrl: Keys.BASEURL,
                constants: constants,
                message: 'message',
                error: req.flash('error'),
                success: req.flash('success'),
            });
        }

        userDetails.password = await bcrypt.hash(reqBody.new_password, 10);
        userDetails.updated_at = await dateFormat.set_current_timestamp();
        userDetails.reset_password_token = null

        const changePassword = updateUser({
            reset_password_token: reqBody.reset_password_token
        }, userDetails)

        // sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.passwordUpdate_success', changePassword, req.headers.lang);

        message = req.flash(
            'success',
            'Your password successfully changed.'
        );

        return res.render('message', {
            req: req,
            logoUrl: Keys.BASEURL + `images/logo/logo.png`,
            appBaseUrl: Keys.BASEURL,
            constants: constants,
            message: 'message',
            error: req.flash('error'),
            success: req.flash('success'),
        });

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}





exports.generate_auth_tokens = async (req, res, next) => {

    try {

        const refresh_tokens = req.body.refresh_tokens
        let user = await User.findOne({ refresh_tokens: refresh_tokens })

        let newToken = await user.generateAuthToken();

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_auth_token', newToken, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}