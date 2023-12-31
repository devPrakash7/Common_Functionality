// const jwt = require('jsonwebtoken')
// const User = require('../models/user.model')
// const constants = require('../config/constants')
// const { sendResponse } = require('../services/common.service')
// const commanMessage = require('../helper/commonMessage')
// const { JWT_SECRET } = require('../keys/keys')

// const auth = async (req, res, next) => 
// {
//     try 
//     {
//         const token = req.header('Authorization').replace('Bearer ', '')
//         const decoded = jwt.verify(token, JWT_SECRET)
//         const user = await User.findOne({ _id: decoded._id, 'tokens.token': token, user_type : 1})

//         if (!user) 
//         {
//             throw new Error()
//         }

//         req.token = token
//         req.user = user
//         next()
//     } catch (err) {
//         console.log(err)
//         sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
//     }
// }

// module.exports = auth




const jwt = require('jsonwebtoken');

var User = require('../models/user.model');
var constants = require('../config/constants')
const { sendResponse } = require('../services/common.service');
const { JWT_SECRET } = require('../keys/keys')

module.exports = {
    verifyAccessToken: async (req, res, next) => {
        try {
            if (!req.header('Authorization')) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

            const token = req.header('Authorization').replace('Bearer ', '');
            if (!token) sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.not_token', {}, req.headers.lang)

            const decoded = await jwt.verify(token, ACCESS_TOKEN_SECRET);

            const user = await User.findOne({ _id: decoded._id, 'tokens': token, user_type: 1 });

            if (!user) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang)

            req.token = token;
            req.user = user;

            next();
        } catch (err) {
            console.log('err....', err)
            sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
        }
    },
    verifyRefreshToken: async (refreshToken) => {
        try {
            const decoded = await jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

            const user = await User.findOne({ _id: decoded._id});
            if (!user) return false;
            return user;
        } catch (err) {
            console.log('err....', err)
            sendResponse(constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
        }
    }
}