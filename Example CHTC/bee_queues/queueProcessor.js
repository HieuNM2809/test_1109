const BeeQueue = require('bee-queue');
const fs = require('fs');
const { Worker } = require('worker_threads');

// Cấu hình BeeQueue
const queue = new BeeQueue('example-queue', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    isWorker: true,
    removeOnSuccess: true
});

// Hàm để chạy tính toán phức tạp trong Worker Thread
function runHeavyComputationInWorker(data) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js', { workerData: data });

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
queue.process(50, async (job) => {
    try {
        const start = Date.now();

        // Chạy tính toán phức tạp trong Worker Thread
        const result = await runHeavyComputationInWorker({ duration: 10000 });
        const end = Date.now();

        const logMessage = `Job ${JSON.stringify(job.data)} bắt đầu lúc: ${new Date(start).toISOString()}, kết thúc lúc: ${new Date(end).toISOString()}, Kết quả: ${result}`;
        await fs.promises.appendFile('job_logs.txt', logMessage + '\n');  // Ghi log không đồng bộ

    } catch (err) {
        console.error(`Job ${job.id} thất bại với lỗi: ${err.message}`);
    }
});
