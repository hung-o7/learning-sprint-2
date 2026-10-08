# Byte by Byte — Buffer Overflow Lab

An interactive, browser-based teaching module for Problem 1. Explore how an unchecked string copy fills a stack buffer and can overwrite nearby memory. This original HTML/CSS/JavaScript implementation is inspired by the educational approach of [BOMOD](https://github.com/benjholla/bomod); no BOMOD code or assets are copied.

## Run

Clone this repository and open **index.html** in a modern browser. No installation, build, internet connection, or server is required.

```sh
git clone https://github.com/hung-o7/learning-sprint-2.git
cd learning-sprint-2
open index.html # macOS; on Windows/Linux, open the file with your browser
```

## Explore

1. Start with **Fits** and press **Step one byte**. Observe the characters followed by the NUL terminator.
2. Select **Off by one** and press **Copy all**. Eight characters fit in eight bytes, but the ninth write (NUL) overwrites the first byte of the simulated saved frame pointer.
3. Select **Overwrite** to observe writes into the saved frame pointer, return address, and adjacent memory.
4. Enable **Use a bounded copy** and repeat. Only seven characters plus NUL are written into an eight-byte buffer. The app reports truncation.
5. Change the capacity to 12 or 16 bytes, or enter your own printable ASCII string. Predict the result before copying. Use the built-in question to check your understanding.

Input, capacity, and copy-mode changes reset the simulation. Presets set input and capacity while preserving copy mode. Reset clears writes while preserving settings. The outlined cell is the latest write. Cells show hexadecimal offsets and byte values; SP means a space, NUL is zero, and a dot means an untouched original byte (not necessarily zero).

## Learning goals and limitations

- A C-style string requires one more byte than its visible character count.
- An unchecked copy can cross a buffer boundary and corrupt adjacent data.
- Checking capacity before writing prevents this specific overflow; truncation still needs explicit handling.
- Buffer overflow concerns memory boundaries, unlike integer overflow, which concerns numeric representation limits.

This is a conceptual simulation. The buffer followed by two 4-byte saved fields is illustrative, not a claim about every stack. Actual layouts and protections vary by architecture and compiler. C out-of-bounds writes have undefined behavior; real programs are not guaranteed to follow this drawing. There is no native memory access, shellcode, executable input, or exploit functionality. ASCII-only input keeps each character equal to one byte; Unicode encoding is outside this module's scope.

## Files and validation

- `index.html`: semantic page, instructions, and knowledge check.
- `style.css`: responsive styling and keyboard focus indicators.
- `model.js`: pure copy and memory simulation.
- `app.js`: controls, rendering, and accessible status updates.
- `model.test.js`: boundary, truncation, empty-input, and validation tests.
- `reflection.md`: a short AI-assisted reflection draft to personalize.

Run tests with Node.js (no dependencies):

```sh
node --test model.test.js
```

For manual browser verification, exercise all three presets in both modes, step to completion, reset, change capacity, and try empty input, spaces, invalid Unicode, and a 24-character string. Check a narrow viewport and keyboard navigation. Status text supplements color.

## AI-assisted workflow

AI assisted with the implementation, explanatory copy, documentation, and tests. The key correctness checks are the extra NUL write, the first out-of-bounds offset, and reserving terminator space in bounded mode. Review and personalize the reflection to describe your own learning accurately.
