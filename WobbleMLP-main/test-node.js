// Test file using Node's built-in test runner
const test = require('node:test');
const assert = require('node:assert');

// This test should always pass
test('1 + 1 should equal 2', (t) => {
  console.log('Running Node.js test...');
  assert.strictEqual(1 + 1, 2);
  console.log('Node.js test passed!');
});

// This will help us see if the file is being executed
console.log('Node.js test file loaded successfully');
