const BeeQueue = require('bee-queue');
const fs = require('fs');
const {Worker} = require('worker_threads');
const redisConfig = require('./config/redis')
const WardTransShipment = require('./app/Models/WardTransShipment.model')

// Cấu hình BeeQueue
const queue = new BeeQueue('transShipments', {
    redis: redisConfig,
    isWorker: true,
    removeOnSuccess: true
});

// Hàm để chạy tính toán phức tạp trong Worker Thread
function runHeavyComputationInWorker(receiverWardId, pickupLocationId) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./app/Workers/worker.js', {workerData: {receiverWardId, pickupLocationId}});

        worker.on('message', (result) => {
            resolve(result);
        });
        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

// Xử lý job trong luồng chính
queue.process(1, async (job) => {
    try {
        const start = Date.now();

        // Chạy tính toán phức tạp trong Worker Thread
        const transShipmentId = await runHeavyComputationInWorker(job.data.ward_id, job.data.pickup_location_id);

        await WardTransShipment.create({
            pickup_location_id: job.data.pickup_location_id,
            trans_shipment_id: transShipmentId || 0,
            ward_id: job.data.ward_id,
        });

        const end = Date.now();
        const logMessage = `Job ${JSON.stringify(job.data)} bắt đầu lúc: ${new Date(start).toISOString()}, kết thúc lúc: ${new Date(end).toISOString()},  Kết quả: ${transShipmentId}`;
        await fs.promises.appendFile('./storage/logs/job_logs.txt', logMessage + '\n');

    } catch (err) {
        console.error(`Job ${job.id} thất bại với lỗi: ${err.message}`);
    }
});
