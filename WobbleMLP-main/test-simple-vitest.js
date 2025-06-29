// Simple test file for Vitest
import { test, expect } from 'vitest';

// Simple test that should always pass
test('simple test', () => {
  console.log('Running simple test...');
  expect(1 + 1).toBe(2);
  console.log('Simple test passed!');
});

// This will help us see if the file is being executed
console.log('Test file loaded successfully');
