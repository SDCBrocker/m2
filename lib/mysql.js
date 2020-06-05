// get the client
const mysql = require('mysql2/promise');
const logging = require('./log');
const config = require('config')

// get the promise implementation, we will use bluebird
const bluebird = require('bluebird');

const mysqlConnection = async () => {
    console.log(config.databaseSettings.user,config.databaseSettings.password)
// create the connection, specify bluebird as Promise
    try {
        global.connection = await mysql.createConnection({
            host: 'localhost',
            user: config.databaseSettings.user,
            password: config.databaseSettings.password,
            //password: "c3jGc3BvbnlCQyPKZZM=:",
            database: config.databaseSettings.database,
            //testOnBorrow: true
        });
        logging.log("Mysql connection connected");
    } catch (err) {
        logging.log("Mysql", err);
    }
    require('./bootstrap').create_user_admin()
    // try {
    //     const  [rows, fields] = await connection.execute('INSERT INTO `tb_users`(`country_code`, `phone_number`, `otp`) VALUES (?,?,?)',["12",12,12]);
    //     console.log("a",rows, fields);
    // } catch (err) {
    //     console.log("a", err);
    // }
}

module.exports = {
    mysqlConnection:mysqlConnection

}