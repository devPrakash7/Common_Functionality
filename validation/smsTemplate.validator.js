const { body } = require('express-validator');

//validate user form detail
exports.smsTemplate_validator = [

    body('title')
    .not()
    .isEmpty()
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_title_length'),  
  body('keys')
    .not()
    .isEmpty()
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_keys')
    .trim(),
  body('subject')
    .not()
    .isEmpty()
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_subject')
    .trim()
    .isLength({ min: 2, max: 16 })
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_subject_length'),
  body('body')
    .not()
    .isEmpty()
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_body')
    .trim()
    .isLength({ min: 10 })
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_body_value'),
  body('status')
    .not()
    .isEmpty()
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_status')
    .trim()
    .isNumeric()
    .withMessage('SMS_TEMPLATE_VALIDATION.sms_status_numeric'),
];