const Queue = require('bee-queue');
const redisConfig = require('../../../config/redis');
const transShipmentsQueue = require('../../Queues/transShipments.queue')

// Tạo và thêm công việc vào hàng đợi
for (let i = 1; i <= 1000; i++) {
    transShipmentsQueue.createJob({number: i})
        .save()
}


// const queue = require('./queue');
// const sequelize = require('./database');
// require('./jobProcessor');
//
// // Tạo và thêm công việc vào hàng đợi
// for (let i = 1; i <= 1000; i++) {
//     queue.createJob({ number: i })
//         .save()
//         .then((job) => {
//             console.log(`Job created with id: ${job.id}`);
//         })
//         .catch((error) => {
//             console.error('Job creation failed:', error);
//         });
// }
//
