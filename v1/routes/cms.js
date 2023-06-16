const express = require('express');
const router = express.Router();


const {
    cmsList,
    getHtml
  } = require('../controllers/cms.controller')

router.get('/cms-list', cmsList);
router.get('/:slug', getHtml);
module.exports = router;

