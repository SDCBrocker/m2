'use strict';
/**
 * Created by Akash Deep on 12/7/15.
 */

const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');

const title = process.env.NODE_ENV ? process.env.NODE_ENV : "local"
exports.plugin = {
    name: 'swagger',
    version: '1.0.0',
    basePath: '/api/',
    register: async function (server, options) {
        const swaggerOptions = {
            info: {
                title: 'CircleApp API Documentation ' + title,
                version: Pack.version,
            },
        };
        await server.register([
            Inert,
            Vision,
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            }
        ]);
    }
};

