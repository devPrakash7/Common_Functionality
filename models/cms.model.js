const mongoose = require('mongoose');
const constants = require('../config/constants');
const { BASEURL } = require('../keys/keys');
const baseUrl = BASEURL

const cmsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String
    },
    lang: {
        type: String,
        default : constants.DEFAULT_LANGUAGE
    },
    static_path: {
        type: String,
        default: constants.DEFAULT_VALUE,
        get: (v) => {
            return (!v) ? null : `${baseUrl}/${v}`;
        }
    },
    static_backup_path: {
        type: String,
        default: constants.DEFAULT_VALUE,
        get: (v) => {
            return (!v) ? null : `${baseUrl}/${v}`;
        }
    },
    file_type: {
        type: Number,
        default: 1     // 1-content 2-link
    },
    content: {
        type: String
    },
    created_at: {
        type: Number
    },
    updated_at: {
        type: Number
    }
});

const cms = mongoose.model('cms', cmsSchema);
module.exports = cms;
