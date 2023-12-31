const sgMail = require('@sendgrid/mail');

const constants=require('../config/constants');

const emailTemplate = require('../models/emailTemplate.model')

const { replaceStringWithObjectData } = require('./common.service')

const {SEND_GRID_API_KEY, EMAIL_FROM}  = require('../keys/keys')

sgMail.setApiKey(SEND_GRID_API_KEY);

//Set up email service
const sendMail = async (req, data) => {
    try {
        if(!data){
          console.log('passed data to send email have not value');
        //   throw new Error('passed data to send email have not value', err)
          return false;
        }
        let templateSlug = data.templateSlug;
        let lang = data.lang ? data.lang : constants.LANG.ENGLISH


        console.log("slug ..lang..", templateSlug, lang)
        let template
        template = await emailTemplate.findOne({'slug': templateSlug, 'lang': lang});
        if (!template) {
          template = await emailTemplate.findOne({'slug': templateSlug, 'lang': constants.LANG.ENGLISH});
        }

        if(!template){
          console.log('template not found from the database');
          return false;
        }
        let replaceObjData = data.data;
        let templateData = template.body;

        
        let body = await replaceStringWithObjectData(templateData, replaceObjData);
        
        let mailContent = body;
  
        const msg = {
          to: data.to,
          from: EMAIL_FROM,
          subject: template.subject,
          html:mailContent
        }

        const sendMail = await sgMail.send(msg);
        return true;
    }
    catch (err) {
        console.log('er....', err);
        throw err
    }
} 

module.exports = sendMail;