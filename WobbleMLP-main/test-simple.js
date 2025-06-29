// Simple test file in root directory
import { test, expect } from 'vitest';

// This test should always pass
test('root test', () => {
  console.log('Running root test...');
  expect(1 + 1).toBe(2);
  console.log('Root test passed!');
});

// This will help us see if the file is being executed
console.log('Root test file loaded successfully');
