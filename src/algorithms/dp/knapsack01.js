/**
 * 0/1 Knapsack — Seasonal Budget Allocation
 * Module 4: Dynamic Programming
 */
export function knapsack01(crops, budget) {
  const n = crops.length;
  const W = Math.min(budget, 100000); // cap for table rendering
  const step = Math.max(1, Math.floor(W / 80)); // reduce columns for display
  const cols = Math.floor(W / step) + 1;

  // Build DP table (n+1) x cols
  const dp = Array.from({ length: n + 1 }, () => new Array(cols).fill(0));
  const fills = [];

  for (let i = 1; i <= n; i++) {
    const cost  = crops[i - 1].packageCost;
    const value = crops[i - 1].expectedYield;
    for (let j = 0; j < cols; j++) {
      const capacity = j * step;
      if (cost <= capacity && dp[i - 1][j - Math.ceil(cost / step)] + value > dp[i - 1][j]) {
        dp[i][j] = dp[i - 1][j - Math.ceil(cost / step)] + value;
        fills.push({ row: i, col: j, value: dp[i][j], action: 'take', crop: crops[i-1].name });
      } else {
        dp[i][j] = dp[i - 1][j];
        fills.push({ row: i, col: j, value: dp[i][j], action: 'skip', crop: crops[i-1].name });
      }
    }
  }

  // Backtrack
  const selected = [];
  const backtrack = [];
  let j = cols - 1;
  for (let i = n; i >= 1; i--) {
    if (dp[i][j] !== dp[i - 1][j]) {
      selected.push(crops[i - 1]);
      backtrack.push({ row: i, col: j, decision: 'included', crop: crops[i - 1].name, cost: crops[i-1].packageCost });
      j -= Math.ceil(crops[i - 1].packageCost / step);
    } else {
      backtrack.push({ row: i, col: j, decision: 'excluded', crop: crops[i - 1].name });
    }
  }

  const totalCost  = selected.reduce((s, c) => s + c.packageCost, 0);
  const totalYield = selected.reduce((s, c) => s + c.expectedYield, 0);

  return { selected, totalCost, totalYield, dp, fills, backtrack, step, cols, n };
}
