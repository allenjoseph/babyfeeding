import dayjs from 'dayjs';
import type { target } from 'noUiSlider';
/**
 * @param slider HtmlElement with an initialized slider
 * @param threshold Minimum proximity (in percentages) to merge tooltips
 * @param separator String joining tooltips
 */
export function mergeTooltips(slider: target, threshold: number, separator: string) {
  const tooltips = slider.noUiSlider?.getTooltips();

  slider.noUiSlider?.on('update', function (values, handle, unencoded, tap, positions) {
    const pools: number[][] = [[]];
    const poolPositions: number[][] = [[]];
    const poolValues: (string | number)[][] = [[]];
    let atPool = 0;

    // Assign the first tooltip to the first pool, if the tooltip is configured
    if (tooltips?.[0]) {
      pools[0][0] = 0;
      poolPositions[0][0] = positions[0];
      poolValues[0][0] = formatSliderValue(values[0]);
    }

    for (let i = 1; i < positions.length; i++) {
      if (!tooltips?.[i] || positions[i] - positions[i - 1] > threshold) {
        atPool++;
        pools[atPool] = [];
        poolValues[atPool] = [];
        poolPositions[atPool] = [];
      }

      if (tooltips?.[i]) {
        pools[atPool].push(i);
        poolValues[atPool].push(formatSliderValue(values[i]));
        poolPositions[atPool].push(positions[i]);
      }
    }

    pools.forEach(function (pool, poolIndex) {
      const handlesInPool = pool.length;

      for (let j = 0; j < handlesInPool; j++) {
        const handleNumber = pool[j];
        if (!tooltips?.[handleNumber]) continue;

        tooltips[handleNumber].innerHTML = poolValues[poolIndex].join(separator);
        tooltips[handleNumber].style.display = 'block';
        // tooltips[handleNumber].style[direction] = offset + '%';

        if (poolValues[poolIndex]?.length > 1 && handleNumber === handle) {
          // Hide this tooltip
          tooltips[handleNumber].style.display = 'none';
        }
      }
    });
  });
}

export function formatSliderValue(value: string | number) {
  return dayjs(Number(value)).format('hh:mm a');
}
