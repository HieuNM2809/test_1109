const tinhToanPhucTap = (data) => {

    console.log(data, ' start ', new Date(Date.now()).toISOString())
    return new Promise((resolve) => {
        process.nextTick(() => {
            const delay = Math.random() * 2000 + 1000;
            const start = Date.now();
            while (Date.now() - start < delay) {
                // Vòng lặp tốn thời gian để giả lập tính toán phức tạp
            }

            console.log(data, ' end ', new Date(Date.now()).toISOString(), delay)
            resolve(data * data);
        });
    });
};

const dataArray = [1, 2, 3, 4, 5];
const promises = dataArray.map(data => tinhToanPhucTap(data));

console.log('111')
process.nextTick(() => {
    console.log('nextTick end')
});

