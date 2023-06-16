const {
    sendResponse
} = require('../../services/common.service')
const constants = require('../../config/constants')


const {
    getAllCountries,
    getStatesOfCountry,
    getCitiesOfState
} = require("../services/country.service");
const e = require('express');

exports.getCountyList = async (req, res) => {
    try {
        let data = await getAllCountries();

        console.log("data...", data.length)

        let usa = data.find(e => e.alpha3Code == "USA")
        let withoutUSA = data.filter(e => e.alpha3Code !== "USA")
        data = [usa, ...withoutUSA]

        data.map(e => {
            let buff = new Buffer(e.name);
            let base64data = buff.toString('base64');
            e.base64data = base64data
            return e
        })


        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'COUNTRY.county_list_fetch_success', data, req.headers.lang);
    } catch (err) {
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};
exports.getStatesOfCountry = async (req, res) => {
    try {
        const countryId = req.params.countryId
        const data = await getStatesOfCountry(countryId);

        data.map(e => {
            let buff = new Buffer(e.name);
            let base64data = buff.toString('base64');
            e.base64data = base64data
            return e
        })


        if (data) {
            sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'COUNTRY.state_list_fetch_success', data, req.headers.lang);
        } else {
            sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'COUNTRY.state_list_not_found', data, req.headers.lang);
        }

    } catch (err) {
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};

exports.getCitiesOfState = async (req, res) => {
    try {
        const stateId = req.params.stateId
        const data = await getCitiesOfState(stateId);

        data.map(e => {
            let buff = new Buffer(e.name);
            let base64data = buff.toString('base64');
            e.base64data = base64data
            return e
        })


        if (data.length > 0) {
            sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'COUNTRY.city_list_fetch_success', data, req.headers.lang);
        } else {
            sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'COUNTRY.city_list_not_found', data, req.headers.lang);
        }
    } catch (err) {
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};

//==========================

// const yourhandle = require('countrycitystatejson')

// exports.getCountyList = async (req, res) => {
// try {
// let data = yourhandle.getCountries();

// console.log("data....",data)

// data.forEach(v => {
// delete v.native;
// delete v.phone;
// delete v.continent;
// delete v.capital;
// delete v.currency;
// delete v.languages;
// delete v.emoji;
// delete v.emojiU;
// });

// console.log(data.length)
// sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'COUNTRY.county_list_fetch_success', data,req.headers.lang);
// } catch (err) {
// sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message,req.headers.lang);
// }
// };
// exports.getStatesOfCountry = async (req, res) => {
// try {
// const countryShortName = req.query.countryShortName

// let data = yourhandle.getStatesByShort(countryShortName)
// console.log(data.length)

// if (data) {
// sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'COUNTRY.state_list_fetch_success', data, req.headers.lang);
// } else {
// sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'COUNTRY.state_list_not_found', data, req.headers.lang);
// }

// } catch (err) {
// sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
// }
// };

// exports.getCitiesOfState = async (req, res) => {
// try {
// const countryShortName = req.query.countryShortName
// const stateName = req.query.stateName

// let data = yourhandle.getCities(countryShortName, stateName)
// console.log(data.length)

// if (data.length > 0) {
// sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'COUNTRY.city_list_fetch_success', data, req.headers.lang);
// } else {
// sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'COUNTRY.city_list_not_found', data, req.headers.lang);
// }
// } catch (err) {
// sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
// }
// };


// "/country/countryList": {
//     "get": {
//     "x-swagger-router-controller": "bar",
//     "tags": [
//     "country"
//     ],
//     "description": "get all country",
//     "parameters": [],
//     "responses": {}
//     }
//     },
//     "/country/states-of-country": {
//     "get": {
//     "x-swagger-router-controller": "bar",
//     "description": "get all state of particular county",
//     "tags": [
//     "country"
//     ],
//     "parameters": [{
//     "name": "countryShortName",
//     "in": "query",
//     "description": "Enter countryShortName",
//     "required": true,
//     "type": "string"
//     }],
//     "responses": {}
//     }
//     },
//     "/country/cities-of-state": {
//     "get": {
//     "x-swagger-router-controller": "bar",
//     "description": "get all city of particular state",
//     "tags": [
//     "country"
//     ],
//     "parameters": [{
//     "name": "countryShortName",
//     "in": "query",
//     "description": "Enter countryShortName",
//     "required": true,
//     "type": "string"
//     },
//     {
//     "name": "stateName",
//     "in": "query",
//     "description": "Enter stateName",
//     "required": true,
//     "type": "string"
//     }
//     ],
//     "responses": {}
//     }
//     },