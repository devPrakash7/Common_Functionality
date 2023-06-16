const express = require('express');
const router = express.Router();


const {
    resetPasswordLinkVerification,
    verifyUserCodeForm,
    verifyUserCode
  } = require('../controllers/web.controller')

router.get('/reset-password', resetPasswordLinkVerification);
router.get('/verify-user-code-form', verifyUserCodeForm);
router.post('/verify-user-code', verifyUserCode);

module.exports = router;

