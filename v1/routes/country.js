var express = require('express');
var router = express.Router();

const {
    getCountyList,
    getStatesOfCountry,
    getCitiesOfState 
} = require('../controllers/country.controller')


router.get('/countryList', getCountyList)
router.get('/states-of-country/:countryId', getStatesOfCountry);
router.get('/cities-of-state/:stateId', getCitiesOfState);

// router.get('/states-of-country', getStatesOfCountry);
// router.get('/cities-of-state', getCitiesOfState);


module.exports = router;
