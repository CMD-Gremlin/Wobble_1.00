// Minimal Vitest test file
import { test, expect } from 'vitest';

// Simple test that should always pass
test('1 + 1 should equal 2', () => {
  console.log('Running minimal Vitest test...');
  expect(1 + 1).toBe(2);
  console.log('Minimal test passed!');
});

// This will help us see if the file is being executed
console.log('Minimal Vitest test file loaded successfully');
