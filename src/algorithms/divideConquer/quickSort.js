/**
 * Quick Sort — Crop Prioritization
 * Module 2: Divide and Conquer
 * Sorts crops by two ratios: yield/cost and yield/water
 */

function quickSortWithTrace(arr, low, high, trace, keyLabel) {
  if (low < high) {
    const pivotIdx = partition(arr, low, high, trace, keyLabel);
    quickSortWithTrace(arr, low, pivotIdx - 1, trace, keyLabel);
    quickSortWithTrace(arr, pivotIdx + 1, high, trace, keyLabel);
  }
  if (low === high) {
    trace.push({ action: 'single', index: low, array: arr.map(x => ({ ...x })) });
  }
}

function partition(arr, low, high, trace, keyLabel) {
  const pivot = arr[high];
  trace.push({
    action: 'pivot_select',
    pivotIndex: high,
    pivotName: pivot.name,
    pivotValue: +pivot[keyLabel].toFixed(2),
    low, high,
    array: arr.map(x => ({ ...x })),
  });

  let i = low - 1;
  for (let j = low; j < high; j++) {
    trace.push({
      action: 'compare',
      i: j, pivotIndex: high,
      compareResult: arr[j][keyLabel] >= pivot[keyLabel],
      array: arr.map(x => ({ ...x })),
    });
    if (arr[j][keyLabel] >= pivot[keyLabel]) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      if (i !== j) {
        trace.push({ action: 'swap', i, j, array: arr.map(x => ({ ...x })) });
      }
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  trace.push({
    action: 'partition_done',
    pivotFinal: i + 1,
    low, high,
    array: arr.map(x => ({ ...x })),
  });
  return i + 1;
}

export function quickSort(crops) {
  // Sort 1: by yield/cost ratio
  const byYieldCost = crops.map(c => ({
    ...c,
    ratio: +(c.expectedYield / c.packageCost).toFixed(2),
    ratioLabel: 'Yield/Cost',
  }));
  const trace1 = [];
  const arr1 = [...byYieldCost];
  quickSortWithTrace(arr1, 0, arr1.length - 1, trace1, 'ratio');
  trace1.push({ action: 'sorted', array: arr1.map(x => ({ ...x })) });

  // Sort 2: by yield/water ratio
  const byYieldWater = crops.map(c => ({
    ...c,
    ratio: +(c.expectedYield / c.waterPerWeek).toFixed(2),
    ratioLabel: 'Yield/Water',
  }));
  const trace2 = [];
  const arr2 = [...byYieldWater];
  quickSortWithTrace(arr2, 0, arr2.length - 1, trace2, 'ratio');
  trace2.push({ action: 'sorted', array: arr2.map(x => ({ ...x })) });

  return {
    sortedByYieldCost:  arr1,
    sortedByYieldWater: arr2,
    trace1,
    trace2,
  };
}
