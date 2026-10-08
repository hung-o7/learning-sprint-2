/* Pure simulation: no process memory, native code, or input execution. */
(function (root) {
  'use strict';
  function createPlan(input, capacity, bounded) {
    if (![8, 12, 16].includes(capacity)) throw new Error('Unsupported capacity.');
    if (!/^[\x20-\x7e]{0,24}$/.test(input)) throw new Error('Use at most 24 printable ASCII characters.');
    const copied = bounded ? input.slice(0, capacity - 1) : input;
    return { capacity, required: input.length + 1, truncated: input.length - copied.length,
      bytes: [...copied].map(char => char.charCodeAt(0)).concat(0) };
  }
  function snapshot(plan, steps) {
    const written = Math.max(0, Math.min(plan.bytes.length, Math.floor(steps)));
    const length = Math.max(plan.capacity + 8, plan.bytes.length);
    const cells = Array.from({ length }, (_, offset) => ({ offset,
      region: offset < plan.capacity ? 'buffer' : offset < plan.capacity + 4 ? 'frame' : offset < plan.capacity + 8 ? 'return' : 'other',
      value: offset < written ? plan.bytes[offset] : null,
      changed: offset < written, overflow: offset < written && offset >= plan.capacity }));
    return { cells, written, overflow: Math.max(0, written - plan.capacity), done: written === plan.bytes.length };
  }
  root.BufferLab = { createPlan, snapshot };
  if (typeof module !== 'undefined') module.exports = root.BufferLab;
})(globalThis);
