const driver = require("../../models/driver.model");
const { Driversave } = require("../../v1/services/driver.service");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const { sendResponse } = require("../../services/common.service");
const { generate_Id } = require("../../middleware/common.function");
const {geocoder } = require("../../middleware/common.function");
const {JWT_SECRET} = require("../../keys/development.keys")
const jwt = require("jsonwebtoken")
const ExcelJs = require("exceljs");
const fs = require("fs");
// const {totalEarningbyDriver} = require("../../middleware/earning.system")



exports.driver_signup = async (req, res) => {

  try {
    
    const reqBody = req.body;
    const {} = reqBody;

    let file = req.file;
    reqBody.driver_img = file.originalname;
    reqBody.driverId = generate_Id();
    const pickup_location = await geocoder.geocode(reqBody.driver_current_location);

     pickup_location.map((item) => {
       reqBody.driver_lat = item.latitude;
       reqBody.driver_long = item.longitude;
    });

    reqBody.authTokens = await jwt.sign(
      {
        data: reqBody.email,
      },
      JWT_SECRET,
      {
        expiresIn: constants.URL_EXPIRE_TIME,
      }
    );

    reqBody.device_type = reqBody.device_type ? reqBody.device_type : null;
    reqBody.device_token = reqBody.device_token ? reqBody.device_token : null;
    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
    const driver = await Driversave(reqBody);

    driver.deleted_at = undefined;
    driver.vehical_number = undefined;
    driver.account_number = undefined;
    driver.ifsc_code = undefined;
    driver.Aadhar_card_number = undefined;
    driver.pan_card_number = undefined;
    driver.driving_licence = undefined;
    driver.driverId = undefined;
    driver.refresh_tokens = undefined;
    driver.authTokens = undefined;
    driver.device_token = undefined;
    driver.device_type = undefined;

    return res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , msg:'SUCCESSFULLY CREATE DRIVER ACCOUNT', driver})

  } catch (err) {
    console.log("Error(driver_signup)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.logout = async (req, res) => {

  try {
    
    console.log(req.drivers)
    const driverId = req.drivers._id;
    let driverData = await driver.findById(driverId);

    driverData.authTokens = null;
    driverData.refresh_tokens = null;

    await driverData.save();
    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"DRIVER LOGOUT SUCESSFULLY"})

  } catch (err) {
    console.log("Error(logout)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};



exports.login = async (req, res) => {

  try {

    const { mobile_number } = req.body;
    let driverdata = await driver.findOne({ mobile_number });

    if (driverdata.user_type == 2)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "Your are not a driver"
      );

    if (driverdata == 1)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "USER.mobile_number_not_found"
      );

    let newToken = await driverdata.generateAuthToken();
    let refreshToken = await driverdata.generateRefreshToken();
    driverdata.authTokens = newToken;
    await driverdata.save();
    driverdata.user_type = undefined;
    driverdata.device_token = undefined;
    driverdata.device_type = undefined;
    driverdata.refresh_tokens = undefined;
    driverdata.deleted_at = undefined;
    driverdata.status = undefined;
    driverdata.driverId = undefined;
    driverdata.__v = undefined;
    driverdata._id = undefined;

    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"DRIVER LOGIN SUCESSFULLY" , driverdata})
  } catch (err) {
    console.log("Error(Login)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.generate_auth_tokens = async (req, res) => {

  try {

    const { refresh_tokens } = req.params;
    const verified = jwt.verify(refresh_tokens, JWT_SECRET);
    console.log(verified)

    let drivers = await driver.findById(verified._id);
    drivers.authTokens = await jwt.sign(
      {
        data: drivers.email,
      },
      JWT_SECRET,
      {
        expiresIn: constants.URL_EXPIRE_TIME,
      }
    );

    await drivers.save();

    return res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , msg:"CREATE NEW AUTH TOKEN"})

  } catch (err) {
    console.log(err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.get_all_driver = async (req, res) => {

  try {

    let drivers = await driver.find(
      {},
      {
        driver_name: 1,
        driver_email: 1,
        driver_mobile_number: 1,
        driver_current_location: 1,
        brand: 1,
        vehical_number: 1,
        truck_type:1,
        status:1,
        driverId:1,
        driver_img:1
      }
    )

    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"SUCESSFULLY GET ALL DRIVER" , drivers})

  } catch (err) {
    console.log("Error(get_all_drivers)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.update_driver_detalis = async (req, res) => {

  try {

    const finddriver = req.drivers._id;

    if (!finddriver) return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "DRIVER NOT FOUND "
    );

    let driverdata = await driver.findOneAndUpdate({ _id: finddriver }, req.body, {
      new: true,
    });

    if (!driverdata)
    return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "DRIVER DATA NOT FOUND"
    );

    driverdata.updated_at = await dateFormat.set_current_timestamp();
    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"DRIVER UPDATE SUCESSFULLY" , driverdata})

  } catch (err) {
    console.log("Error(update_driver_detalis)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.driver_account_actived = async (req, res) => {

  try {

    const findDriver = req.drivers._id;

    if (!findDriver)
       return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "DRIVER DATA NOT FOUND "
    );;

    let driverData = await await driver.findOneAndUpdate({ _id: findDriver }, {
      $set:{status:constants.STATUS.ACCOUNT_ACTIVE}
   },{new:true});

    if (!driverData)
       return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "DRIVER DATA NOT FOUND "
    );

    driverData.updated_at = await dateFormat.set_current_timestamp();
    await driverData.save()

    let Drivers = driverData.status

    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS,
      msg:"DRIVER SUCESSFULLY ACTIVED" , Drivers})
    

  } catch (err) {
    console.log("Error(driver_account_actived)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.export_driver_data_into_excel_file = async (req, res) => {

  try {

    const users = await driver.find({ user_type: 1 });
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("My Users");
    worksheet.columns = [
      { header: "driver_img", key: "driver_img", width: 30 },
      { header: "driver_name", key: "driver_name", width: 20 },
      { header: "driver_email", key: "driver_email", width: 20 },
      { header: "driver_mobile_number", key: "driver_mobile_number", width: 20 },
      { header: "status", key: "status", width: 20 },
      { header: "truck_type", key: "truck_type", width: 20 },
      { header: "brand", key: "brand", width: 20 },
      { header: "vehical_number", key: "vehical_number", width: 20 },
      { header: "Aadhar_card_number", key: "Aadhar_card_number", width: 15 },
      { header: "pan_card_number", key: "pan_card_number", width: 15 },
      { header: "driving_licence", key: "driving_licence", width: 20 },
      { header: "account_number", key: "account_number", width: 15 },
      { header: "ifsc_code", key: "ifsc_code", width: 20 },
      { header: "created_at", key: "created_at", width: 30 },
      { header: "updated_at", key: "updated_at", width: 30 },
    ];
    let count = 1;
    users.forEach((user) => {
      user.s_no = count;
      worksheet.addRow(user);
      count += 1;
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    await workbook.xlsx.writeFile("driver.xlsx");

    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS,
      msg:"CREATE NEW EXCEL FILE"})

  } catch (err) {
    console.log("Error( export_driver_data_into_excel_file)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};



exports.driver_file_export_into_csv_file = async (req, res) => {

  try {
    
    const users = await driver.find({ user_type: 1 });
    const csvData = users.map(
      (user) =>
        `${user.driver_img},${user.driver_name},${user.driver_email},${user.driver_mobile_number}, ${user.status},${user.Aadhar_card_number},${user.pan_card_number}${user.ifsc_code},${user.account_number},${user.created_at},${user.updated_at}`
    );
    const csvContent = `driver_img,email,driver_name,driver_email,driver_mobile_number,status,Aadhar_card_number,pan_card_number,ifsc_code,account_number,created_at,updated_at\n${csvData.join(
      "\n"
    )}`;

    fs.writeFile("DriverData.csv", csvContent, (error) => {
      if (error) {
        console.error("Error creating CSV file:", error);
      } else {
        return res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , msg:"CREATE NEW CSV FILE"})
      }
    });
     
  } catch (err) {
    console.log("Error(driver_file_export_into_csv_file)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

