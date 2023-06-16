const { body } = require('express-validator');

exports.add_cms_validator = [
  body('title')
    .not()
    .isEmpty()
    .withMessage('CMS_VALIDATION.title_required')
    .trim(),
  body('slug')
    .not()
    .isEmpty()
    .withMessage('CMS_VALIDATION.slug_required')
    .trim(),
  body('content')
    .not()
    .isEmpty()
    .withMessage('CMS_VALIDATION.content_required')
    .trim(),
];

exports.get_single_cms_validator = [
  body('id')
    .not()
    .isEmpty()
    .withMessage('CMS_VALIDATION.id_required')
    .trim(),
];