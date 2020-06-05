'use strict';
/**
 * Created by Akash Deep on 08/05/2019
 */

exports.plugin = {
    name: 'good log',
    version: '1.0.0',
    register: async function (server, options) {
        const opt = {
            ops: {
                interval: 1000
            },
            reporters: {
                myConsoleReporter: [
                    {
                        module: '@hapi/good-squeeze',
                        name: 'Squeeze',
                        args: [{ log: '*', response: '*' }]
                    },
                    {
                        module: '@hapi/good-console'
                    },
                    'stdout'
                ]
            }
        };
        await server.register({
            plugin: require('@hapi/good'),
            opt}
        );
    }
};