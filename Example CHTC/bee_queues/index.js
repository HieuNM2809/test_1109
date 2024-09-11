const Queue = require('bee-queue');
const queue = new Queue('example-queue', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

// Tạo và thêm công việc vào hàng đợi
for (let i = 1; i <= 100; i++) {
    queue.createJob({ number: i })
        .save()
}
