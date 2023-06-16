var express = require('express');
const router = express.Router();
const {smsTemplate_validator} = require('../../validation/smsTemplate.validator');
const { validatorFunc } = require('../../helper/commonFunction.helper');
// const auth = require('../../middleware/auth.middleware');

const {
    createSMSTemplate,
    updateSMSTemplate,
    getSingleSMSTemplate,
    getAllSMSTemplate,
    deleteSMSTemplate
} = require('../controllers/smsTemplate.controller');



router.post('/createSMSTemplate',  smsTemplate_validator, validatorFunc, createSMSTemplate);
router.put('/updateSMSTemplate/:id',  smsTemplate_validator, validatorFunc, updateSMSTemplate);
router.get('/getSingleSMSTemplate/:id', getSingleSMSTemplate);
router.get('/getAllSMSTemplate', getAllSMSTemplate);
router.delete('/deleteSMSTemplate/:id', deleteSMSTemplate);

module.exports = router;