const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPlan, snapshot } = require('./model.js');
test('empty input still writes NUL', () => {
  const plan = createPlan('', 8, false);
  assert.deepEqual(plan.bytes, [0]); assert.equal(snapshot(plan, 1).overflow, 0);
});
test('seven characters plus NUL fit exactly', () => {
  const s = snapshot(createPlan('ABCDEFG', 8, false), 8);
  assert.equal(s.done, true); assert.equal(s.overflow, 0); assert.equal(s.cells[7].value, 0);
});
test('eighth character fits but NUL overflows', () => {
  const p = createPlan('ABCDEFGH', 8, false);
  assert.equal(snapshot(p, 8).overflow, 0);
  const s = snapshot(p, 9);
  assert.equal(s.overflow, 1); assert.equal(s.cells[8].region, 'frame'); assert.equal(s.cells[8].value, 0);
});
test('longest input remains visible across saved fields', () => {
  const s = snapshot(createPlan('A'.repeat(24), 8, false), 100);
  assert.equal(s.cells.length, 25); assert.equal(s.cells[12].region, 'return');
  assert.equal(s.cells[16].region, 'other'); assert.equal(s.cells[24].value, 0); assert.equal(s.overflow, 17);
});
test('bounded copy reserves NUL at every capacity and length', () => {
  for (const capacity of [8, 12, 16]) for (let length = 0; length <= 24; length++) {
    const p = createPlan('A'.repeat(length), capacity, true), s = snapshot(p, 100);
    assert.equal(s.overflow, 0); assert.equal(s.written, Math.min(length + 1, capacity));
    assert.equal(p.bytes.at(-1), 0); assert.equal(p.truncated, Math.max(0, length - capacity + 1));
  }
});
test('unchecked boundaries across every supported capacity, length, and step', () => {
  for (const capacity of [8, 12, 16]) for (let length = 0; length <= 24; length++) {
    const p = createPlan('A'.repeat(length), capacity, false);
    for (let steps = 0; steps <= length + 1; steps++) {
      const s = snapshot(p, steps);
      assert.equal(s.overflow, Math.max(0, steps - capacity));
      assert.equal(s.cells.filter(c => c.changed).length, steps);
    }
  }
});
test('rejects multibyte and control characters, excessive input, and invalid capacity', () => {
  for (const input of ['é', '🙂', '\n', '\0', 'A'.repeat(25)]) assert.throws(() => createPlan(input, 8, false));
  assert.throws(() => createPlan('A', 0, false));
  assert.deepEqual(createPlan(' <', 8, false).bytes, [32, 60, 0]);
});
