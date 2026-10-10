/*
 * Pure teaching simulation: this module only creates JavaScript data. It never
 * reads process memory, runs native code, or executes user input.
 */
(function (root) {
  'use strict';

  /**
   * Validate an experiment and return the exact bytes the copy will attempt.
   *
   * Bounded mode reserves the final buffer byte for NUL. Printable ASCII keeps
   * the lesson's one-character-equals-one-byte assumption explicit.
   */
  function createPlan(input, capacity, bounded) {
    if (![8, 12, 16].includes(capacity)) throw new Error('Unsupported capacity.');
    if (!/^[\x20-\x7e]{0,24}$/.test(input)) throw new Error('Use at most 24 printable ASCII characters.');
    const copied = bounded ? input.slice(0, capacity - 1) : input;
    return { capacity, required: input.length + 1, truncated: input.length - copied.length,
      bytes: [...copied].map(char => char.charCodeAt(0)).concat(0) };
  }

  /**
   * Return the simulated memory after a requested number of byte writes.
   *
   * The memory grows beyond the fixed teaching fields when necessary so every
   * write remains visible. Clamping `steps` also lets the UI safely use a large
   * number for its "Copy all" action.
   */
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
