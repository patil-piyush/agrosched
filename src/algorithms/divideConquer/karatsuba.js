/**
 * Karatsuba Multiplication — Large Yield Arithmetic
 * Module 2: Divide and Conquer
 * Fixed: no module-level mutable globals
 */

function karatsubaRec(x, y, level, trace) {
  if (x < 10n || y < 10n) {
    const result = x * y;
    trace.push({ level, x: x.toString(), y: y.toString(), action: 'base_case', result: result.toString() });
    return result;
  }
  const m  = Math.floor(Math.max(x.toString().length, y.toString().length) / 2);
  const m2 = 10n ** BigInt(m);

  const x1 = x / m2, x0 = x % m2;
  const y1 = y / m2, y0 = y % m2;

  trace.push({ level, x: x.toString(), y: y.toString(), action: 'split',
    x1: x1.toString(), x0: x0.toString(), y1: y1.toString(), y0: y0.toString(), m });

  if (trace.length > 60) return x * y; // safety cap

  const z2 = karatsubaRec(x1, y1, level + 1, trace);
  const z0 = karatsubaRec(x0, y0, level + 1, trace);
  const z1 = karatsubaRec(x1 + x0, y1 + y0, level + 1, trace) - z2 - z0;

  const result = z2 * (m2 * m2) + z1 * m2 + z0;
  trace.push({ level, x: x.toString(), y: y.toString(), action: 'combine',
    z0: z0.toString(), z1: z1.toString(), z2: z2.toString(), result: result.toString() });

  return result;
}

export function karatsuba(xStr, yStr) {
  const trace = [];
  const x = BigInt(xStr), y = BigInt(yStr);
  const result = karatsubaRec(x, y, 0, trace);
  const n = Math.max(xStr.length, yStr.length);
  const standardOps  = n * n;
  const karatsubaOps = Math.round(Math.pow(n, 1.585));
  return {
    result: result.toString(),
    trace,
    standardOps,
    karatsubaOps,
    savings: Math.round((1 - karatsubaOps / standardOps) * 100),
  };
}

export function buildFarmMultiplication(farm) {
  // Real numbers: totalArea (×100 to make integer) × (avgYield × weeks × pricePerUnit)
  const totalArea = Math.round(farm.plots.reduce((s, p) => s + p.area, 0) * 100); // e.g. 1300
  const avgYield  = Math.round(farm.crops.reduce((s, c) => s + c.expectedYield, 0) / farm.crops.length);
  const weeks     = farm.season.totalWeeks;
  const price     = 45;
  const x = String(totalArea).padEnd(7, '0');
  const y = String(avgYield * weeks * price);
  return { x, y, totalArea, avgYield, weeks, price };
}
