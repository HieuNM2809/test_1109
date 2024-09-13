const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');

// Hàm tính toán phức tạp sử dụng worker_threads
const tinhToanPhucTap = (data, delay) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'worker.js'), {
            workerData: { data, delay }
        });

        worker.on('message', (result) => {
            const start = new Date(result.startTime).toISOString();
            const end = new Date(result.endTime).toISOString();
            console.log(`Job ${result.data} bắt đầu lúc: ${start}, kết thúc lúc: ${end}, kết quả: ${result.ketQua}`);
            resolve(result.ketQua);
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};

// Tạo 1000 job
const dataArray = [];
const desiredLength = 10000;

for (let i = 0; i < desiredLength; i++) {
    dataArray.push(i);
}

// Hàm chạy các batch job
const runBatch = async (batchSize, dataArray) => {
    for (let i = 0; i < dataArray.length; i += batchSize) {
        const batch = dataArray.slice(i, i + batchSize);  // Chia thành từng batch 10 job
        console.log(`Chạy batch từ ${i} đến ${i + batch.length - 1}`);

        const batchPromises = batch.map(data => {
            const delay = Math.random() * 40000 + 20000;  // Random từ 20 giây đến 1 phút
            return tinhToanPhucTap(data, 20000)
                .then(ketQua => {
                    const logMessage = `Kết quả cho ${data}: ${ketQua}\n`;
                    fs.appendFileSync(path.join(__dirname, 'ketqua.txt'), logMessage, (err) => {
                        if (err) {
                            console.error('Lỗi khi ghi vào tệp:', err);
                        }
                    });
                });
        });

        // Chờ cho batch hiện tại hoàn thành
        await Promise.all(batchPromises);
        console.log(`Batch ${i / batchSize + 1} hoàn thành.`);
    }
};

// Chạy các batch job
runBatch(100, dataArray)
    .then(() => console.log('Tất cả các phép toán đã hoàn thành.'))
    .catch(err => console.error('Đã xảy ra lỗi:', err));

