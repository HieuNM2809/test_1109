// worker.js
const { parentPort, workerData } = require('worker_threads');

const tinhToanPhucTap = (data) => {
    const start = Date.now();
    while (Date.now() - start < workerData.delay) {
        // Vòng lặp giả lập công việc phức tạp
    }
    return data * data;
};

// Ghi nhận thời gian bắt đầu và thực hiện tính toán
const startTime = Date.now();
const ketQua = tinhToanPhucTap(workerData.data);
const endTime = Date.now();

// Gửi kết quả về cùng với thời gian bắt đầu và kết thúc
parentPort.postMessage({
    data: workerData.data,
    ketQua,
    startTime,
    endTime
});
