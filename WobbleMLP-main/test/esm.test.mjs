// ESM test file for Vitest
import { test, expect } from 'vitest';

test('1 + 1 should equal 2', () => {
  console.log('Running ESM test...');
  expect(1 + 1).toBe(2);
  console.log('ESM test passed!');
});

// This will help us see if the file is being executed
console.log('ESM test file loaded successfully');
