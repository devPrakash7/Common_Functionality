var express = require('express');
var router = express.Router(); 

const { verifyAccessToken } = require('../../middleware/admin.middleware')
const {add_cms_validator, get_single_cms_validator} = require('../../validation/cms.validator');
const {validatorFunc} = require('../../helper/commonFunction.helper'); 
const zipFileUpload = require('../../middleware/zipFileUpload');


const {
  addCms,
  getCmsList,
  getSingleCms,
  updateCms,
  uploadCms,
  changeFileType
} = require('../controllers/cms.controller')

router.post('/addCms',add_cms_validator,validatorFunc, addCms)
router.get('/getCmsList', getCmsList)
router.get('/getCmsDetails/:cmsId', getSingleCms)
router.put('/editCms', add_cms_validator,validatorFunc, updateCms)
router.post('/upload-cms/:cmsId', zipFileUpload, uploadCms);
router.put('/changeFileType', changeFileType)


module.exports = router;

