/**
 * Created by Akash Deep on 08/05/2019.
 */
module.exports = [
    { plugin: require('./swagger') },
    { plugin: require('hapi-auth-basic') },
    { plugin: require('./good-console') },
    { plugin: require('./auth-token') }
];