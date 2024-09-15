const tinhToanPhucTap = (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Giả lập thời gian tính toán phức tạp
            let start = Date.now();
            while (Date.now() - start < 2000) {
                // Vòng lặp giả lập
            }
            resolve(data * data);
        }, 0); // Thực hiện ngay sau khi event loop trống
    });
};

const dataArray = [1, 2, 3, 4, 5];
const promises = dataArray.map(data => tinhToanPhucTap(data));

Promise.all(promises)
    .then(results => {
        console.log("Kết quả:", results);
    });
