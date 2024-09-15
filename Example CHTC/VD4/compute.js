// Hàm mô phỏng tính toán phức tạp
function performHeavyComputation(input) {
    const start = Date.now();

    while (Date.now() - start < input.duration) {
        // Tính toán phức tạp
    }
    return `Tính toán hoàn thành sau ${input.duration}ms`;
}

module.exports = { performHeavyComputation };
