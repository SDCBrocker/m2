/**
 * Created by Akash Deep on 09/05/2019.
 */
const Joi = require('joi');
const config = require('config');
const MD5 = require('md5');
const Boom = require('@hapi/boom');
const randomString = require("randomstring");
const validator = require('validator');
const logging = require("../lib/log");
const fs_await = require('fs-extra');
const crypto = require('crypto');
const constant = require('../lib/constant')
const Path = require('path');
const AWS = require('aws-sdk');
const file_read = require('fs')
const PushNotifications = require('node-pushnotifications');
const path = require('path');

const settings = {
    gcm: {
        id: "AAAA4gm-zPk:APA91bEaOVEe1joJ_3zYZ-PCYJbU_5Ku4Z9uqRAHJp0KWCLh0Oqf5KLHn5OkKms4hdyKbn6VphdVgjSPnZGZoK3Bwoe2zpfjWEgjw6ivnClzxxJPHwdfN_j5QThefqNpha4m_VMdkoMo",
        phonegap: false // phonegap compatibility mode, see below (defaults to false)

    },
    apn: {
        token: {
            key: file_read.readFileSync(path.join(__dirname, './AuthKey_CG4MV9B87R.p8')), // optionally: fs.readFileSync('./certs/key.p8')
            keyId: 'CG4MV9B87R',
            teamId: 'WTDABNVNP4',
        },
        production: false // true for APN production environment, false for APN sandbox environment,

    },
    isAlwaysUseFCM: true, // true all messages will be sent through node-gcm (which actually uses FCM)
};
const push_send_user = new PushNotifications(settings);

const sendError = (data) => {
    if (typeof data == 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('customMessage')) {
        let errorToSend = Boom.create(data.statusCode, data.customMessage);
        errorToSend.output.payload.responseType = data.type;
        errorToSend.output.payload.language = data.language;
        return errorToSend;
    } else {
        let errorToSend = '';
        if (typeof data == 'object') {
            if (data.name == 'MongoError') {
                errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage;
                if (data.code = 11000) {
                    let duplicateValue = data.errmsg && data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
                    duplicateValue = duplicateValue.replace('}', '');
                    errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + " : " + duplicateValue;
                    if (data.message.indexOf('customer_1_streetAddress_1_city_1_state_1_country_1_zip_1') > -1) {
                        errorToSend = CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_ADDRESS.customMessage;
                    }
                }
            } else if (data.name == 'ApplicationError') {
                errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + ' : ';
            } else if (data.name == 'ValidationError') {
                errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + data.message;
            } else if (data.name == 'CastError') {
                errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage + CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID.customMessage + data.value;
            }
        } else {
            errorToSend = data
        }
        let customErrorMessage = errorToSend;
        if (typeof customErrorMessage == 'string') {
            if (errorToSend.indexOf("[") > -1) {
                customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
            }
            customErrorMessage = customErrorMessage && customErrorMessage.replace(/"/g, '');
            customErrorMessage = customErrorMessage && customErrorMessage.replace('[', '');
            customErrorMessage = customErrorMessage && customErrorMessage.replace(']', '');
        }
        return Boom.badRequest(customErrorMessage)
    }
};

const sendSuccess = (successMsg, data) => {
    successMsg = successMsg || constant.status_msg.success.default.customMessage
    if (typeof successMsg == 'object' && successMsg.statusCode && successMsg.customMessage) {
        return { statusCode: successMsg.statusCode, message: successMsg.customMessage, data: data || null, language: successMsg.language };
        //return {statusCode:successMsg.statusCode, message: successMsg.customMessage, data: data || null};
    } else {
        return { statusCode: 200, message: constant.status_msg.success.default.customMessage, data: data || null, language: successMsg.language };
        // return {statusCode:200, message: successMsg, data: data || null};

    }
};


const failActionFunction = (request, h, error, source) => {
    let customErrorMessage = '';
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage;
    delete error.output.payload.validation
    return (error);
};


const customQueryDataValidations = (type, key, data, callback) => {
    let schema = {};
    switch (type) {
        case 'PHONE_NO': schema[key] = Joi.string().regex(/^[0-9]+$/).length(10);
            break;
        case 'NAME': schema[key] = Joi.string().regex(/^[a-zA-Z ]+$/).min(2);
            break;
        case 'BOOLEAN': schema[key] = Joi.boolean();
            break;
    }
    let value = {};
    value[key] = data;

    Joi.validate(value, schema, callback);
};



const authorizationHeaderObj = Joi.object().required().keys({
    authorization: Joi.string().required().description('Please add bearer before token .e.g:- bearer token')
}).unknown();


const CryptData = (stringToCrypt) => {
    return MD5(MD5(stringToCrypt));
};

const generateRandomString = () => {
    return randomString.generate(7);
};

const filterArray = (array) => {
    return array.filter((n) => {
        return n != undefined && n != ''
    });
};

const sanitizeName = (string) => {
    return filterArray(string && string.split(' ') || []).join(' ')
};

const verifyEmailFormat = (string) => {
    return validator.isEmail(string)
};


const generateRandomStringNumber = (len) => {
    let text = "";

    let charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}


const encryptCC = (plainText, workingKey, cb) => {
    try {

        let m = crypto.createHash('md5');
        m.update(workingKey);
        let key = m.digest();
        let iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
        let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let encoded = cipher.update(plainText, 'utf8', 'hex');
        encoded += cipher.final('hex');
        return cb(null, encoded)
    } catch (err) {
        // console.info("---akash-----",err)
        return cb("error in code")
    }
};



const decryptCC = (encText, workingKey, cb) => {

    //   console.info("---encText-----",encText,workingKey,cb)


    try {
        // console.info("---akashdeep-----")
        let m = crypto.createHash('md5');
        m.update(workingKey)
        let key = m.digest('binary');
        let iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
        let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decoded = decipher.update(encText, 'hex', 'utf8');
        decoded += decipher.final('utf8');
        return cb(null, decoded)

    } catch (err) {
        //  console.info("---akash-----",err)
        return cb("error in code")
    }
};

const upload_image_s3 = async (fileData, folderName, folder) => {
    try {
        const imageURL = file_name(fileData.filename, "123")
        let path = Path.resolve(".") + "/upload/" + imageURL;
        let copy = await copyFiles(fileData.path, path)
        let originalPath = Path.resolve(".") + "/upload/" + imageURL;
        AWS.config.update({
            accessKeyId: config.s3.accessKeyId,
            secretAccessKey: config.s3.secretAccessKey,
            region: 'ap-south-1'
        });
        let s3 = new AWS.S3();
        const userFolder = 'user'
        let s3JSON = {
            Key: imageURL,
            Bucket: config.s3.bucket,
            ContentType: fileData.headers['content-type'],
            Body: file_read.createReadStream(originalPath),
            ACL: 'public-read',
        }
        let path1 = await s3.putObject(s3JSON).promise();
        await fs_await.remove(originalPath);
        return config.s3.s3URL + imageURL
    }
    catch (e) {
        console.log(e)
        return e;
    }
}
const copyFiles = async (fileData, path) => {
    try {
        await fs_await.copy(fileData, path)
    } catch (err) {
        console.error(err)
    }
}

const file_name = (fullFileName, userId) => {
    let time = new Date().getTime()
    var prefix = 'customer';
    var ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0, fullFileName.length);
    var ranNum = generateRandomString()
    return prefix + ranNum + time + ext;
};

const send_push = (data, token) => {
    console.log("send_push", token)

    const send_data = {
        title: 'Chime', // REQUIRED for Android
        topic: 'Chime', // REQUIRED for iOS (apn and gcm)
        /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app.
         * When using certificate-based authentication, the topic is usually your app's bundle ID.
         * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
         */
        body: 'Powered by AppFeel',
        custom: {
            data: data,
            sender: 'AppFeel',
        },
        priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high'
        collapseKey: '', // gcm for android, used as collapseId in apn
        contentAvailable: true, // gcm, apn. node-apn will translate true to 1 as required by apn.
        delayWhileIdle: true, // gcm for android
        restrictedPackageName: '', // gcm for android
        dryRun: false, // gcm for android
        icon: '', // gcm for android
        tag: '', // gcm for android
        color: '', // gcm for android
        clickAction: '', // gcm for android. In ios, category will be used if not supplied
        //  locKey: '', // gcm, apn
        // locArgs: '', // gcm, apn
        titleLocKey: '', // gcm, apn
        titleLocArgs: '', // gcm, apn
        retries: 1, // gcm, apn
        encoding: '', // apn
        badge: 2, // gcm for ios, apn
        sound: 'ping.aiff', // gcm, apn
        alert: data,
        /*
         * A string is also accepted as a payload for alert
         * Your notification won't appear on ios if alert is empty object
         * If alert is an empty string the regular 'title' and 'body' will show in Notification
         */
        // alert: '',
        launchImage: '', // apn and gcm for ios
        action: '', // apn and gcm for ios
        // category: 'group_list', // apn and gcm for ios
        // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands.
        // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
        urlArgs: '', // apn and gcm for ios
        truncateAtWordEnd: true, // apn and gcm for ios
        mutableContent: 0, // apn
        threadId: '', // apn
        // if both expiry and timeToLive are given, expiry will take precedence
        expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // seconds
        timeToLive: 28 * 86400,
        headers: [], // wns
        launch: '', // wns
        duration: '', // wns
        consolidationKey: 'my notification', // ADM
    };
    let registrationIds = token
    // You can use it in node callback style
    push_send_user.send(registrationIds, send_data, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("push notification -> success: " + result[0].success + " failure:" + result[0].failure);
        }
    });
}
const send_push_dynamic = (data, token, title, pushTitle) => {
    const send_data_pus = {
        title: pushTitle.title || 'Chime', // REQUIRED for Android
        topic: 'Chime', // REQUIRED for iOS (apn and gcm)
        /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app.
         * When using certificate-based authentication, the topic is usually your app's bundle ID.
         * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
         */
        body: title,
        custom: {
            sender: 'WooHoo',
            data: data
        },
        priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high'
        collapseKey: '', // gcm for android, used as collapseId in apn
        contentAvailable: true, // gcm, apn. node-apn will translate true to 1 as required by apn.
        delayWhileIdle: true, // gcm for android
        restrictedPackageName: '', // gcm for android
        dryRun: false, // gcm for android
        icon: '', // gcm for android
        tag: '', // gcm for android
        color: '', // gcm for android
        clickAction: '', // gcm for android. In ios, category will be used if not supplied
        // locKey: '', // gcm, apn
        // locArgs: '', // gcm, apn
        //titleLocKey: '', // gcm, apn
        //  titleLocArgs: '', // gcm, apn
        retries: 1, // gcm, apn
        encoding: '', // apn
        badge: 2, // gcm for ios, apn
        sound: 'ping.aiff', // gcm, apn
        alert: data,
        /*
         * A string is also accepted as a payload for alert
         * Your notification won't appear on ios if alert is empty object
         * If alert is an empty string the regular 'title' and 'body' will show in Notification
         */
        // alert: '',
        launchImage: '', // apn and gcm for ios
        action: '', // apn and gcm for ios
        // category: 'group_msg', // apn and gcm for ios
        // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands.
        // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
        urlArgs: '', // apn and gcm for ios
        truncateAtWordEnd: true, // apn and gcm for ios
        mutableContent: 0, // apn
        threadId: '', // apn
        // if both expiry and timeToLive are given, expiry will take precedence
        expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // seconds
        timeToLive: 28 * 86400,
        headers: [], // wns
        launch: '', // wns
        duration: '', // wns
        consolidationKey: 'my notification', // ADM
    };
    let registrationIds = token
    // You can use it in node callback style
    push_send_user.send(registrationIds, send_data_pus, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("send_push_dynamic", token, title);
            console.log("push notification -> success: " + result[0].success + " failure:" + result[0].failure);
        }
    });
}
module.exports = {
    sendError: sendError,
    sendSuccess: sendSuccess,
    CryptData: CryptData,
    failActionFunction: failActionFunction,
    verifyEmailFormat: verifyEmailFormat,
    sanitizeName: sanitizeName,
    filterArray: filterArray,
    generateRandomString: generateRandomString,
    customQueryDataValidations: customQueryDataValidations,
    generateRandomStringNumber: generateRandomStringNumber,
    encryptCC: encryptCC,
    decryptCC: decryptCC,
    authorizationHeaderObj: authorizationHeaderObj,
    upload_image_s3: upload_image_s3,
    send_push: send_push,
    send_push_dynamic: send_push_dynamic
};