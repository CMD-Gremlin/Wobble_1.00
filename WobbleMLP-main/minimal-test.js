// Minimal test file for Vitest
import { test, expect } from 'vitest';

// Simple test that should always pass
test('minimal test', () => {
  console.log('Running minimal test...');
  expect(1 + 1).toBe(2);
  console.log('Minimal test passed!');
});

// This will help us see if the file is being executed
console.log('Minimal test file loaded successfully');
