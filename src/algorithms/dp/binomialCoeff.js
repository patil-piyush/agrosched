/**
 * Binomial Coefficients — Pascal's Triangle
 * Module 4: Dynamic Programming
 */
export function binomialCoeff(n, k) {
  const maxN = Math.min(n, 20); // cap for display
  const table = Array.from({ length: maxN + 1 }, () => new Array(maxN + 1).fill(0));
  const fills = [];

  for (let i = 0; i <= maxN; i++) {
    table[i][0] = 1;
    fills.push({ row: i, col: 0, value: 1, action: 'base' });
    for (let j = 1; j <= i; j++) {
      table[i][j] = table[i - 1][j - 1] + table[i - 1][j];
      fills.push({ row: i, col: j, value: table[i][j], action: 'fill', from: [i-1, j-1], fromRight: [i-1, j] });
    }
  }

  const result = k <= maxN && n <= maxN ? table[maxN][Math.min(k, maxN)] : 'very large';

  // Approximate for display when n/k > 20
  let approxResult = result;
  if (n > 20 || k > 20) {
    // Logarithmic approximation
    let log = 0;
    for (let i = 0; i < Math.min(k, n - k); i++) {
      log += Math.log10(n - i) - Math.log10(i + 1);
    }
    approxResult = `~10^${Math.round(log)}`;
  }

  return { table, fills, result, approxResult, n: maxN, k: Math.min(k, maxN) };
}

// Build the combination count from farm data
export function buildCombinationCount(farm) {
  const n = farm.crops.length * farm.plots.length * 3; // crops × plots × phases
  const k = farm.plots.length;
  return { n, k };
}
