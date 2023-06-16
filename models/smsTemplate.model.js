const mongoose = require('mongoose');

var smsSchema = new mongoose.Schema({
    id:{
        type: Number,
    },
    title: {
        type: String,
        default: null,
        trim: true,
    },
    keys:{
        type: String,
        default: null,
        trim: true,
    },
    subject: {
        type: String,
        default: null,
        trim: true,
    },
    body: {
        type: String,
        default: null,
        trim: true,
    },
    status:{
        type:Number,
        default:null
    },
    created_at: {
        type: Number,
    },
    updated_at: {
        type: Number,
    },
});
var SMSFormat = mongoose.model('sms_templates', smsSchema);
module.exports = SMSFormat;