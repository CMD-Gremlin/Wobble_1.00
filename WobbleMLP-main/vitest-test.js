// Simple test file to verify Vitest is working
const { test } = require('vitest');

// Simple test case
test('1 + 1 should equal 2', () => {
  console.log('Running test...');
  if (1 + 1 !== 2) {
    throw new Error('Test failed');
  }
  console.log('Test passed!');
});

console.log('Test file loaded successfully');
