// Simple test file to verify test runner functionality
const test = require('node:test');
const assert = require('node:assert');

test('synchronous passing test', (t) => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(1, 1);
});

test('asynchronous passing test', async (t) => {
  // This test passes because the Promise returned by the async
  // function is not rejected.
  assert.strictEqual(1, 1);
});

console.log('Test file loaded successfully');
