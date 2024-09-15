const { parentPort, workerData } = require('worker_threads');
const { performHeavyComputation } = require('../Services/transShipments.service');

// Nếu là Worker, thực hiện công việc tính toán
if (parentPort) {
    const result = performHeavyComputation(workerData);
    parentPort.postMessage(result);
}
