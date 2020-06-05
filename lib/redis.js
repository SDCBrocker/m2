

const redis = require('redis');
const config = require('config')

const redisConnection = () => {
redis_client = redis.createClient(config.databaseSettings.redis.port, config.databaseSettings.redis.host);
redis_client.on('connect', function () {

});
}

module.exports = {
    redisConnection:redisConnection

}