const Keys = require('../../keys/keys')
const Cms = require('../../models/cms.model')

const constants = require('../../config/constants')

const {
  sendResponse
} = require('../../services/common.service')
exports.cmsList = async (req, res) => {
  try {

    let data = await Cms.find().lean()

    let Arr = []
    data.forEach(e => {
      if (e.file_type == 2) {
        e.link = Keys.BASEURL + e.static_path +"/"
      } else {
        e.link = Keys.BASEURL + "v1/cms/" + e.slug
      }
      delete e._id
      delete e.lang
      delete e.title
      delete e.content
      delete e.created_at
      delete e.updated_at
      delete e.file_type
      delete e.static_backup_path
      delete e.static_path
      delete e.__v
    })


    console.log("data...", data)
    sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CMS.cms_list_fetch_success', data,req.headers.lang);
  } catch (err) {
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message,req.headers.lang);
  }

};

exports.getHtml = async (req, res) => {
  try {

    let slug = req.params.slug
    let data = await Cms.findOne({slug }).select('content title').lean()


    return res.render('cmsPage', {

      content: data.content,
      title : data.title

    });

    console.log("data...", data)

  } catch (err) {
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message,req.headers.lang);
  }

};
