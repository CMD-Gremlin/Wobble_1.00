// Simple test file to verify test setup
import { test, expect } from 'vitest';

test('simple test', () => {
  console.log('Running simple test...');
  expect(1 + 1).toBe(2);
  console.log('Simple test passed!');
});

console.log('Test file loaded successfully');
