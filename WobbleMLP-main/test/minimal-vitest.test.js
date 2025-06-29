// Minimal Vitest test file
import { describe, it, expect } from 'vitest';

describe('Minimal Vitest Test', () => {
  it('should pass a simple test', () => {
    console.log('Running minimal test...');
    expect(1 + 1).toBe(2);
  });
});

// Add a test that will run immediately
console.log('Test file is being loaded');
const test = it('immediate test', () => {
  console.log('Running immediate test...');
  expect(true).toBe(true);
});

test();
