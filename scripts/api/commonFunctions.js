export function normalizePercentages(arr) {
    const total = arr.reduce((sum, val) => sum + val, 0);
    if (total === 0) return arr.map(() => 0); // avoid div by zero
    return arr.map((val) => (val / total) * 100);
}

export function weightedRandomIndex(percentages) {
    const total = percentages.reduce((sum, val) => sum + val, 0);
    const rand = Math.random() * total;
    let cumulative = 0;

    for (let i = 0; i < percentages.length; i++) {
        cumulative += percentages[i];
        if (rand < cumulative) return i;
    }
    return percentages.length - 1; // fallback just in case
}
