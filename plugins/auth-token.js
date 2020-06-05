'use strict';
/**
 * Created by Akash Deep on 08/05/2019
 */

const TokenManager = require('../lib/token_manager');
const AuthBearer = require('hapi-auth-bearer-token');
const DAO = require('../DAO/mysql');
exports.plugin = {
    name: 'auth-token-plugin',
    version: '1.0.0',
    register: async function (server, options) {
        await server.register(AuthBearer);
        server.auth.strategy('userAuth', 'bearer-access-token', {
            allowQueryToken: true,              // optional, false by default
            allowMultipleHeaders: true,
            validate: async (request, token, h) => {
                let isValid = false
                let userData;
                let credentials
                const data = await check_user(token)
                if(data && data.length > 0){
                    isValid = true;
                    userData = data[0]
                    credentials = data[0]
                    if(data[0].is_block == 1){
                        isValid = false;
                    }
                }
                return { isValid, credentials, userData };

            }
        }),
            server.auth.strategy('adminAuth', 'bearer-access-token', {
                allowQueryToken: true,              // optional, false by default
                allowMultipleHeaders: true,
                validate: async (request, token, h) => {
                    let isValid = false
                    let userData;
                    let credentials
                    const data = await check_admin(token)
                    if(data && data.length > 0){
                        isValid = true;
                        userData = data[0]
                        credentials = data[0]
                    }
                    return { isValid, credentials, userData };

                }
            });
    }
}


const check_user = async(token) => {
    try {
        let sql = 'select * from tb_users where access_token = ? limit 1'
        return await DAO.mysql_query("get_user",sql ,[token]);
    } catch (error) {
        throw error;
    }

}

const check_admin = async(token) => {
    try {
        let sql = 'select * from tb_admin where access_token = ? limit 1'
        return await DAO.mysql_query("get_user",sql ,[token]);
    } catch (error) {
        throw error;
    }

}