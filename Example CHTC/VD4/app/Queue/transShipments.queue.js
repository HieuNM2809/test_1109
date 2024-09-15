const Queue = require('bee-queue');
const redisConfig = require('../../config/redis');

const queue = new Queue('transShipments', {
    redis: redisConfig,
});

module.exports = queue;
