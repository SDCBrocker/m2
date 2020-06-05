'use strict';

/**
 * Created by Akash Deep on 08/05/2019.
 */

//External Dependencies
const hapi = require('hapi');
const config = require('config');
const routes = require('./routes');
const plugins = require('./plugins');
const mysql = require('./lib/mysql');
const basicAuth = require('./lib/basicAuth');
process.env.NODE_CONFIG_DIR = 'config/';
(async () => {
    let server = await new hapi.Server({
        //host: 'localhost',
        port: config.PORT,
        routes: {
            "cors": {
                origin: ["*"],
                headers: ["Accept", "Content-Type"],
                additionalHeaders: ["X-Requested-With", "Access-Control-Allow-Origin", "utcoffset", 'authorization']
            }
        }
    });



    try {
        mysql.mysqlConnection();
        await server.register(plugins);
        server.auth.strategy('simple', 'basic', basicAuth)
        server.events.on('response', (request, event, tags) => {
            let method = request.method;
            if (method !== "get") {
                const xFF = request.headers['x-forwarded-for']
                const ip = xFF ? xFF.split(',')[0] : request.info.remoteAddress
                let route = request.path;
                var origin = request.headers['origin'];
                console.log("******* Request Info **********");
                console.log("IP- " + ip + " \nOrigin- " + origin + " \nRemoteAddress- " + request.info.remoteAddress + " \nTime- " + new Date() + " \nMethod- " + method + " \nURL- " + route);
                console.log("*******************************");
            }
        });
        await server.start();
        console.log('Server running at:', server.info.uri);
        console.log('Server running at:', process.env.NODE_ENV);

    } catch (err) {
        console.log("errrrrr", err);
    }

    server.route(routes);
})();



