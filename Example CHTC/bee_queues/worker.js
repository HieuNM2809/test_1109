const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const BeeQueue = require('bee-queue');
const fs = require('fs');

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
        const worker = new Worker(__filename, { workerData: data });

        worker.on('message', (result) => {
            resolve(result);
            // worker.terminate();  // Giải phóng worker ngay sau khi nhận được kết quả
        });

        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

// Nếu là Worker, thực hiện công việc tính toán
if (!isMainThread) {
    const result = performHeavyComputation(workerData);
    parentPort.postMessage(result);
}

// Hàm mô phỏng tính toán phức tạp
function performHeavyComputation(input) {
    const start = Date.now();

    while (Date.now() - start < input.duration) {
        // Tính toán phức tạp
    }
    return `Tính toán hoàn thành sau ${input.duration}ms`;
}

// Xử lý job trong luồng chính
queue.process(10, async (job) => {
    try {
        const start = Date.now();

        // Chạy tính toán phức tạp trong Worker Thread
        const result = await runHeavyComputationInWorker({ duration: 20000 });
        const end = Date.now();

        const logMessage = `Job ${JSON.stringify(job.data)} bắt đầu lúc: ${new Date(start).toISOString()}, kết thúc lúc: ${new Date(end).toISOString()}, Kết quả: ${result}`;
        await fs.promises.appendFile('logs/queue.log', logMessage + '\n');  // Ghi log không đồng bộ

    } catch (err) {
        console.error(`Job ${job.id} thất bại với lỗi: ${err.message}`);
    }
});
