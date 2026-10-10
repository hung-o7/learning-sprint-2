# Byte by Byte — Buffer Overflow Lab

An interactive, browser-based teaching module for exploring how an unchecked
string copy fills a stack buffer and can overwrite nearby memory. The project is
implemented with plain HTML, CSS, and JavaScript so the simulation can be read,
run, and modified without a build system.

This original implementation is inspired by the educational approach of
[BOMOD](https://github.com/benjholla/bomod); no BOMOD code or assets are copied.

## Run

Clone this repository and open `index.html` in a modern browser. No installation,
build, internet connection, or local server is required.

```sh
git clone https://github.com/hung-o7/learning-sprint-2.git
cd learning-sprint-2
open index.html # macOS; on Windows/Linux, open the file with your browser
```

The automated tests require a current version of Node.js that supports the
built-in `node:test` module (Node.js 18 or later is recommended):

```sh
node --test model.test.js
```

## Explore

1. Start with **Fits** and press **Step one byte**. Observe the characters followed by the NUL terminator.
2. Select **Off by one** and press **Copy all**. Eight characters fit in eight bytes, but the ninth write (NUL) overwrites the first byte of the simulated saved frame pointer.
3. Select **Overwrite** to observe writes into the saved frame pointer, return address, and adjacent memory.
4. Enable **Use a bounded copy** and repeat. Only seven characters plus NUL are written into an eight-byte buffer. The app reports truncation.
5. Change the capacity to 12 or 16 bytes, or enter your own printable ASCII string. Predict the result before copying. Use the built-in question to check your understanding.

Input, capacity, and copy-mode changes reset the simulation. Presets set the
input and capacity while preserving copy mode. Reset clears writes while
preserving the current settings.

The outlined cell is the latest write. Cells show hexadecimal offsets and byte
values: `SP` means a space, `NUL` is zero, and a dot means an untouched original
byte (not necessarily a byte whose value is zero).

## Learning goals and limitations

- A C-style string requires one more byte than its visible character count.
- An unchecked copy can cross a buffer boundary and corrupt adjacent data.
- Checking capacity before writing prevents this specific overflow; truncation still needs explicit handling.
- Buffer overflow concerns memory boundaries, unlike integer overflow, which concerns numeric representation limits.

This is a conceptual simulation. The buffer followed by two 4-byte saved fields is illustrative, not a claim about every stack. Actual layouts and protections vary by architecture and compiler. C out-of-bounds writes have undefined behavior; real programs are not guaranteed to follow this drawing. There is no native memory access, shellcode, executable input, or exploit functionality. ASCII-only input keeps each character equal to one byte; Unicode encoding is outside this module's scope.

## How the project works

The application has two layers:

1. `model.js` validates the experiment settings and creates a list of bytes to
   write. It then produces a snapshot for a requested number of copy steps.
2. `app.js` reads the controls, asks the model for a snapshot, and renders the
   memory regions and explanatory status text into the page.

Keeping the simulation model independent from the DOM makes its boundary
behavior testable in Node.js. `model.js` exposes the same `BufferLab` API in the
browser and through CommonJS for the test file.

The simulated memory is divided into four regions:

| Region | Size | Purpose in the teaching model |
| --- | ---: | --- |
| Local character buffer | 8, 12, or 16 bytes | Destination of the copy |
| Saved frame pointer | 4 bytes | First adjacent field that can be overwritten |
| Return address | 4 bytes | Illustrates more serious adjacent corruption |
| Other adjacent memory | As needed | Keeps every generated write visible |

The unchecked plan copies every input byte followed by `NUL`. The bounded plan
copies at most `capacity - 1` input bytes and always appends `NUL`, so all writes
remain inside the buffer.

## Project structure

- `index.html`: semantic page, instructions, and knowledge check.
- `style.css`: responsive styling and keyboard focus indicators.
- `model.js`: input validation and pure copy/memory simulation.
- `app.js`: controls, rendering, and accessible status updates.
- `model.test.js`: boundary, truncation, empty-input, and validation tests.
- `reflection.md`: a short AI-assisted reflection draft to personalize.
- `CONTRIBUTING.md`: development conventions and contribution checklist.

## Validation

Run all automated tests from the repository root:

```sh
node --test model.test.js
```

For manual browser verification:

1. Exercise all three presets in unchecked and bounded modes.
2. Step each scenario to completion, then verify **Copy all** and **Reset**.
3. Try every capacity plus empty input, spaces, invalid Unicode, and a
   24-character string.
4. Check keyboard navigation and a viewport narrower than 520 pixels.
5. Confirm that status text communicates the result without relying on color.

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding conventions and a pull-request
checklist.

## AI-assisted workflow

AI assisted with the implementation, explanatory copy, documentation, and
tests. The key correctness checks are the extra `NUL` write, the first
out-of-bounds offset, and reserving terminator space in bounded mode. Review and
personalize `reflection.md` so it describes your own learning accurately.
