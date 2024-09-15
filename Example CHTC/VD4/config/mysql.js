module.exports.option = {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    retry: {
        // match: [/Deadlock/i, /Connection lost/i],
        max: 3,  // Số lần thử lại khi lỗi kết nối
    }
};
module.exports.DATABASE = 'hasakinow_db';
module.exports.USERNAME = 'root';
module.exports.PASSWORD = 'root@123';
