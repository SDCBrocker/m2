'use strict';
/**
 * Created by Akash Deep on 08/05/2019
 */
const Jwt = require('jsonwebtoken');
const async = require('async');
const winston = require("./log");
const constant = require("./constant");
const config = require('config');


const getTokenFromDB = async (userId, userType, token) => {

    try {


        // let userData  = await runQuery('SELECT * from user') // you query for any table
        //
        // let bookingData  = await runQuery('SELECT * from booking')  // you pother  query for any table

        return { userId: userId, userType: userType }
    } catch (err) {
        throw err
        console.error(err.message);
    } finally {
        console.log("finally");
    }
}

const verifyToken = function (token, callback) {
    var response = {
        valid: false
    };
    Jwt.verify(token, config.get('JWT_SECRET_KEY'), function (err, decoded) {
        winston.log('jwt err', err, decoded)
        if (err) {
            callback(err)
        } else {
            getTokenFromDB(decoded.id, decoded.type, token, callback);
        }
    });
};





const setToken = function (tokenData, callback) {
    if (!tokenData.id || !tokenData.type) {
        callback(co);
    } else {
        var tokenToSend = Jwt.sign(tokenData, config.get('JWT_SECRET_KEY'));
        callback(err, { accessToken: tokenToSend })
    }
};

const expireToken = function (token, callback) {
    Jwt.verify(token, config.get('JWT_SECRET_KEY'), function (err, decoded) {
        if (err) {
            callback(constant.status_error.invalid_token);
        } else {
            callback(err, decoded)
        }
    });
};

const decodeToken = function (token, callback) {
    Jwt.verify(token, config.get('JWT_SECRET_KEY'), function (err, decodedData) {
        if (err) {
            callback(constant.status_error.invalid_token);
        } else {
            callback(null, decodedData)
        }
    })
};

const create_token = (userData) => {
    let data = {
        user_id: userData.user_id,
        type: userData.type
    }
    var token = Jwt.sign(data, config.JWT_SECRET_KEY);
    return token
}

module.exports = {
    expireToken: expireToken,
    setToken: setToken,
    verifyToken: verifyToken,
    decodeToken: decodeToken,
    create_token: create_token
};