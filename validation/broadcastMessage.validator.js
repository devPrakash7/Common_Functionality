const { body } = require('express-validator');

/**
 *  Validate Add Broadcast Message Form
 * @param {String} message - predefined message which we need to show in app side.
 * @param {String} messageLanguage - messageLanguage in which we need to store message.
 * @returns {Object} messageData - Returns messageData.
 * we will add message which we need to show as predefined messages.
 */ 
exports.addBroadcastMessageValidator = [
    body('broadcastName')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.broadcast_name')
        .trim()
        .isString()
        .withMessage('BROADCAST_MESSAGE.broadcast_name_string')
        .isLength({ min: 2, max: 50 })
        .withMessage('BROADCAST_MESSAGE.broadcast_name_length'),
    body('broadcastMessage')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.broadcast_message')
        .trim()
        .isString()
        .withMessage('BROADCAST_MESSAGE.broadcast_message_string')
        .isLength({ min: 2, max: 150 })
        .withMessage('BROADCAST_MESSAGE.broadcast_message_length'),
    body('messageLanguage')
        .optional()
        .trim()
        .isString()
        .withMessage('BROADCAST_MESSAGE.broadcast_message_language_string')
        .isLength({ min: 2, max: 3 })
        .withMessage('BROADCAST_MESSAGE.broadcast_message_language_length'),
];

/**
 *  Validate Update Broadcast Message Form
 * @param {ObjectId} _id - _id which we want to update message.
 * @param {String} message - predefined message which we need to show in app side.
 * @param {String} messageLanguage - messageLanguage in which we need to store message.
 */ 
exports.updateBroadcastMessageValidator = [
    body('_id')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.broadcast_message_id')
        .trim(),
    body('broadcastName')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.broadcast_name')
        .trim()
        .isString()
        .withMessage('BROADCAST_MESSAGE.broadcast_name_string')
        .isLength({ min: 2, max: 50 })
        .withMessage('BROADCAST_MESSAGE.broadcast_name_length'),
    body('broadcastMessage')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.broadcast_message')
        .trim()
        .isString()
        .withMessage('BROADCAST_MESSAGE.broadcast_message_string')
        .isLength({ min: 2, max: 150 })
        .withMessage('BROADCAST_MESSAGE.broadcast_message_length'),
    body('messageLanguage')
        .optional()
        .trim()
        .isString()
        .withMessage('BROADCAST_MESSAGE.broadcast_message_language_string')
        .isLength({ min: 2, max: 3 })
        .withMessage('BROADCAST_MESSAGE.broadcast_message_language_length'),
];

/**
 *  Validate Active Inactive Broadcast Message Form
 * @param {ObjectId} _id - _id which we want to update message.
 * @param {String} status - status of message which we you need to change to.
 */ 
exports.activeInactiveBroadcastMessageValidator = [
    body('_id')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.broadcast_message_id')
        .trim(),
    body('status')
        .optional()
        .trim()
        .isNumeric()
        .withMessage('BROADCAST_MESSAGE.broadcast_message_status_numeric')
        .matches(/^[0-1]$/)
        .withMessage('BROADCAST_MESSAGE.broadcast_message_status_value'),
];

/**
 *  Validate Post Broadcast Message Form
 * @param {ObjectId} _contestId - _contestId In which contest user wants to post broadcast message.
 * @param {String} contestType - contestType which contest type it is like Trivia, DFS or League.
 * @param {String} broadcastMessage - broadcastMessage which user wants to share.
 */ 
exports.postBroadcastMessageValidator = [
    body('_contestId')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.contest_id')
        .isString()
        .withMessage('BROADCAST_MESSAGE.contest_id_string')
        .trim(),
    body('contestType')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.contest_type')
        .trim()
        .isNumeric()
        .withMessage('BROADCAST_MESSAGE.contest_type_numeric')
        .matches(/^[0-2]$/)
        .withMessage('BROADCAST_MESSAGE.contest_type_value'),
    body('broadcastType')
        .not()
        .isEmpty()
        .withMessage('BROADCAST_MESSAGE.broadcast_type')
        .trim()
        .isNumeric()
        .withMessage('BROADCAST_MESSAGE.broadcast_type_numeric')
        .matches(/^[1-2]$/)
        .withMessage('BROADCAST_MESSAGE.broadcast_type_value'),
];