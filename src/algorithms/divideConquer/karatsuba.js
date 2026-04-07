/**
 * Karatsuba Multiplication — Large Yield Arithmetic
 * Module 2: Divide and Conquer
 */

let _step = 0;
const _trace = [];

function karatsubaRec(x, y, level) {
  if (x < 10n || y < 10n) {
    const result = x * y;
    _trace.push({ step: ++_step, level, x: x.toString(), y: y.toString(), action: 'base_case', result: result.toString() });
    return result;
  }

  const xStr = x.toString();
  const yStr = y.toString();
  const m  = Math.floor(Math.max(xStr.length, yStr.length) / 2);
  const m2 = BigInt(10) ** BigInt(m);

  const x1 = x / m2;
  const x0 = x % m2;
  const y1 = y / m2;
  const y0 = y % m2;

  _trace.push({
    step: ++_step, level,
    x: x.toString(), y: y.toString(),
    action: 'split',
    x1: x1.toString(), x0: x0.toString(),
    y1: y1.toString(), y0: y0.toString(),
    m,
  });

  const z2 = karatsubaRec(x1, y1, level + 1);
  const z0 = karatsubaRec(x0, y0, level + 1);
  const z1 = karatsubaRec(x1 + x0, y1 + y0, level + 1) - z2 - z0;

  const result = z2 * (m2 * m2) + z1 * m2 + z0;

  _trace.push({
    step: ++_step, level,
    x: x.toString(), y: y.toString(),
    action: 'combine',
    z0: z0.toString(), z1: z1.toString(), z2: z2.toString(),
    result: result.toString(),
  });

  return result;
}

export function karatsuba(xStr, yStr) {
  _step = 0;
  _trace.length = 0;

  const x = BigInt(xStr);
  const y = BigInt(yStr);

  const result = karatsubaRec(x, y, 0);

  // Standard multiplication ops = n^2, Karatsuba = n^1.585
  const n = Math.max(xStr.length, yStr.length);
  const standardOps = n * n;
  const karatsubaOps = Math.round(Math.pow(n, 1.585));

  return {
    result: result.toString(),
    trace: [..._trace],
    standardOps,
    karatsubaOps,
    savings: Math.round((1 - karatsubaOps / standardOps) * 100),
  };
}

// Build the large numbers from farm data
export function buildFarmMultiplication(farm) {
  const totalArea = farm.plots.reduce((s, p) => s + p.area, 0);
  const avgYield  = Math.round(farm.crops.reduce((s, c) => s + c.expectedYield, 0) / farm.crops.length);
  const weeks     = farm.season.totalWeeks;
  const price     = 45; // avg ₹/kg

  // x = totalArea * 100 (to make it a larger integer), y = avgYield * weeks * price
  const x = Math.round(totalArea * 100).toString().padEnd(8, '1');
  const y = Math.round(avgYield * weeks * price).toString().padEnd(8, '3');

  return { x, y, totalArea, avgYield, weeks, price };
}
