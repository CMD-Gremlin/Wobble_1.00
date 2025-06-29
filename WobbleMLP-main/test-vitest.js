// Simple test file for Vitest
import { test, expect } from 'vitest';

// This test should always pass
test('1 + 1 should equal 2', () => {
  console.log('Running test...');
  expect(1 + 1).toBe(2);
  console.log('Test passed!');
});

// This will help us see if the file is being executed
console.log('Test file loaded successfully');
