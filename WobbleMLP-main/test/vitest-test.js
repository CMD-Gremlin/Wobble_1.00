// Simple test file to verify Vitest is working
import { test, expect } from 'vitest';

// This test should always pass
test('1 + 1 should equal 2', () => {
  console.log('Running Vitest test...');
  expect(1 + 1).toBe(2);
  console.log('Vitest test passed!');
});

// This will help us see if the file is being executed
console.log('Vitest test file loaded successfully');
