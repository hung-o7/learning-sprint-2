'use strict';
const $ = id => document.getElementById(id);
let steps = 0;
const labels = { buffer: 'Local character buffer', frame: 'Saved frame pointer', return: 'Return address', other: 'Other adjacent memory' };

// Render entirely from the controls and step count so reset and input changes
// cannot leave stale memory cells or status text behind.
function render() {
  let plan;
  try {
    plan = BufferLab.createPlan($('input').value, Number($('size').value), $('bounded').checked);
    $('error').textContent = ''; $('input').removeAttribute('aria-invalid');
  } catch (error) {
    $('error').textContent = error.message; $('input').setAttribute('aria-invalid', 'true');
    $('step').disabled = $('run').disabled = true; $('regions').replaceChildren();
    for (const id of ['required', 'capacity', 'progress']) $(id).textContent = '—';
    $('badge').textContent = 'Invalid input'; $('badge').className = 'badge danger';
    $('status-title').textContent = 'Update the input to continue';
    $('status').textContent = 'This model uses printable ASCII so that one character always equals one byte.'; return;
  }
  const state = BufferLab.snapshot(plan, steps);
  $('required').textContent = `${plan.required} B`; $('capacity').textContent = `${plan.capacity} B`;
  $('progress').textContent = `${state.written} / ${plan.bytes.length}`;
  $('step').disabled = $('run').disabled = state.done;
  $('badge').textContent = state.overflow ? 'Overflow' : state.done ? 'Within bounds' : state.written ? 'Copying' : 'Ready';
  $('badge').className = `badge${state.overflow ? ' danger' : ''}`;
  $('regions').replaceChildren();
  for (const [key, label] of Object.entries(labels)) {
    const cells = state.cells.filter(cell => cell.region === key); if (!cells.length) continue;
    const region = document.createElement('div'); region.className = 'region';
    const heading = document.createElement('div'); heading.className = 'region-title';
    const title = document.createElement('strong'); title.textContent = label;
    const count = document.createElement('span'); count.textContent = `${cells.length} bytes · ${key === 'buffer' ? 'copy destination' : 'outside buffer'}`;
    heading.append(title, count);
    const grid = document.createElement('div'); grid.className = 'cells';
    for (const cell of cells) {
      const box = document.createElement('div');
      box.className = `cell ${cell.changed ? cell.overflow ? 'overwritten' : 'filled' : ''} ${cell.offset === state.written - 1 ? 'current' : ''}`;
      const offset = document.createElement('small'); offset.textContent = `+${cell.offset.toString(16).toUpperCase().padStart(2, '0')}`;
      const value = document.createElement('b'); value.textContent = cell.value === null ? '·' : cell.value === 0 ? 'NUL' : cell.value === 32 ? 'SP' : String.fromCharCode(cell.value);
      const hex = document.createElement('em'); hex.textContent = cell.value === null ? '—' : cell.value.toString(16).toUpperCase().padStart(2, '0');
      // The label repeats color-coded state in text for screen-reader users.
      box.setAttribute('aria-label', `Offset ${cell.offset}, ${label}, ${cell.changed ? `written byte ${hex.textContent}${cell.overflow ? ', outside buffer' : ''}` : 'untouched original byte'}`);
      box.append(offset, value, hex); grid.append(box);
    }
    region.append(heading, grid); $('regions').append(region);
  }
  const last = state.cells[state.written - 1];
  $('status-title').textContent = state.overflow ? `${state.overflow} byte${state.overflow === 1 ? '' : 's'} written outside the buffer` : state.done ? 'Copy complete — no out-of-bounds writes' : state.written ? `Byte ${state.written} written inside the buffer` : 'Predict what happens, then step through';
  let message = state.written ? `The latest write placed ${last.value === 0 ? 'the NUL terminator' : `ASCII byte 0x${last.value.toString(16).toUpperCase()}`} at offset ${last.offset} in ${labels[last.region].toLowerCase()}. ` : `This input needs ${plan.required} bytes including NUL; the buffer has ${plan.capacity}. `;
  if ($('bounded').checked) message += plan.truncated ? `Bounded mode discards ${plan.truncated} input character(s) and keeps the terminator inside the buffer.` : 'Bounded mode reserves room for NUL.';
  else if (state.overflow) message += 'Unchecked copying has crossed the buffer boundary. This is simulated corruption, not execution.';
  else message += state.done ? 'All characters and the terminator fit.' : 'The unchecked model will continue writing even after the buffer is full.';
  $('status').textContent = message;
}
function reset() { steps = 0; render(); }
$('input').addEventListener('input', reset); $('size').addEventListener('change', reset); $('bounded').addEventListener('change', reset);
$('step').addEventListener('click', () => { steps++; render(); });
// snapshot() clamps this sentinel to the plan length; supported input is capped
// at 24 characters, so 25 always means "show every byte, including NUL."
$('run').addEventListener('click', () => { steps = 25; render(); }); $('reset').addEventListener('click', reset);
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => { $('input').value = button.dataset.preset; $('size').value = '8'; reset(); }));
render();
