import { describe, expect, it } from 'vitest';

import { getMediumGen } from '../agency/getMediumGen';

function buildTree(end: number, nodeCounts: number[]) {
  const list = [
    {
      count: 1,
      gen: 0,
      id: '0',
    },
  ];
  const lastCount = nodeCounts.at(-1) ?? 1;
  for (let i = 1; i <= end; i++) {
    list.push({
      count: nodeCounts[i - 1] ?? lastCount,
      gen: i,
      id: `${i}`,
    });
  }
  return list;
}

describe('getMediumGen', () => {
  it('1 > 1 should be 3', () => {
    expect(getMediumGen(buildTree(2, [1, 1]))).toBe(3);
  });
  it('1 > 3 > 9 should be 3', () => {
    expect(getMediumGen(buildTree(3, [1, 3, 9]))).toBe(4);
  });

  it('1 > 1 > 3 > 2 should be 4', () => {
    expect(getMediumGen(buildTree(4, [1, 1, 3, 2]))).toBe(4);
  });

  it('1 should be 2', () => {
    expect(getMediumGen(buildTree(1, [1]))).toBe(2);
  });

  it('1>2>3>4>5>15 should be 5', () => {
    expect(getMediumGen(buildTree(6, [1, 2, 3, 4, 5, 15]))).toBe(7);
  });
  it('1>2>3>4>5>6>18 should be 6', () => {
    expect(getMediumGen(buildTree(7, [1, 2, 3, 4, 5, 6, 18]))).toBe(8);
  });
});
