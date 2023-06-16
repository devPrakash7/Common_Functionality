const Keys = require('../../keys/keys')
const User = require('../../models/user.model')
const DeletedAccount = require('../../models/deletedAccount.model');

const constants = require('../../config/constants')

exports.resetPasswordLinkVerification = async (req, res) => {
    try {
      if (req.query.token == undefined) {
        return res.render('notFound');
      }
      let token = req.query.token;
      let message = '';
  
      let user = await User.findOne({
        reset_password_token: token,
      });

  
      if (!user) {

        message = req.flash(
            'error',
            'Your reset password link expire or invalid.'
          );          

        return res.render('message', {
            req: req,
            logoUrl: Keys.BASEURL+`images/logo/logo.png`,
            appBaseUrl: Keys.BASEURL,
            constants: constants,
            message: 'message',
            error: req.flash('error'),
            success: req.flash('success'),
          });
      }

      res.render('forgotPassword', {
        req: req,
        logoUrl: Keys.BASEURL+`images/logo/logo.png`,
        appBaseUrl: Keys.BASEURL,
        constants: constants,
        message: 'message',
        error: req.flash('error'),
        success: req.flash('success'),
      });
    } catch (error) {
        console.log("error..", error)

      return res.render('notFound');
    }
  };



  exports.verifyUserCodeForm = async (req, res) => {
    res.render('verifyUserCodeForm', {
      req: req,
      logoUrl: commonFunction.getLogoUrl(),
      constants: constants,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  };
  
  exports.verifyUserCode = async (req, res) => {
    let facebookId = req.body.facebookId;
    let code = req.body.code;
  
    if (!facebookId || facebookId.trim() == '') {
      message = req.flash(
        'error',
        response.responseIn('MESSAGES.USER.fbid_required', req.headers.lang),
      );
  
      return res.render('verifyUserCodeForm', {
        req: req,
        logoUrl: commonFunction.getLogoUrl(),
        constants: constants,
        message: message,
        error: req.flash('error'),
        success: req.flash('success'),
      });
    }
  
    let findFBDeletedUser = await DeletedAccount.find({
      facebookId: facebookId,
      code: code,
    });
  
    if (findFBDeletedUser.length > 0) {
      message = req.flash(
        'success',
        response.responseIn(
          'MESSAGES.USER.ACCOUNT_DELETE_SUCCESS',
          req.headers.lang,
        ),
      );
  
      res.render('verifyUserCodeForm', {
        req: req,
        logoUrl: commonFunction.getLogoUrl(),
        constants: constants,
        message: message,
        error: req.flash('error'),
        success: req.flash('success'),
      });
    } else {
      message = req.flash(
        'error',
        response.responseIn(
          'MESSAGES.USER.ACCOUNT_DELETE_USER_NOT_FOUND',
          req.headers.lang,
        ),
      );
  
      return res.redirect(
        `${appBaseUrl}/web/verify-user-code-form?facebookId=${facebookId}`,
      );
    }
  };