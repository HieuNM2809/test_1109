const BeeQueue = require('bee-queue');
const redis = require('redis');

// Cấu hình kết nối Redis

// Tạo queue mới
const queue = new BeeQueue('example-queue', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    isWorker: true,
    removeOnSuccess: true
});

// Xử lý job
queue.process(10, async (job) => {
    console.log(`Processing job ${job.id} with data: ${JSON.stringify(job.data)}`);

    // Simulate processing time
    const delay = Math.random() * 20000 + 20000; // Random delay between 20 and 40 seconds
    const start = Date.now();

    try {
        // Busy wait to simulate complex computation
        // while (Date.now() - start < delay) {
        //     // Simulate heavy computation
        // }
        setTimeout(() => {
            const end = Date.now();
            console.log(`Job ${job.id} bắt đầu lúc: ${new Date(start).toISOString()}, kết thúc lúc: ${new Date(end).toISOString()}`);

            logToFile(`Job ${job.id} bắt đầu lúc: ${new Date(start).toISOString()}, kết thúc lúc: ${new Date(end).toISOString()}`);

        }, delay);

        // const end = Date.now();
        // console.log(`Job ${job.id} bắt đầu lúc: ${new Date(start).toISOString()}, kết thúc lúc: ${new Date(end).toISOString()}`);
    } catch (err) {
        console.error(`Job ${job.id} failed with error: ${err.message}`);
    }
});
