# Reflection — Buffer Overflow Visualization

*AI-assisted draft: review and personalize this reflection so it accurately represents your experience before submitting.*

This project explores buffer overflow through a browser-based simulation. The most useful distinction is between the number of visible characters and the number of bytes a C-style string needs. A string with eight ASCII characters requires nine bytes when its NUL terminator is included. In an eight-byte buffer, the terminator alone can cause an off-by-one overflow.

The visualization makes this boundary concrete. Stepping through the copy shows exactly when a write leaves the buffer and enters the illustrative saved frame pointer or return address. Comparing the same input in bounded and unchecked modes shows that preventing the out-of-bounds write requires checking available space before writing. Bounded copying also introduces a tradeoff: input may be truncated, which an application must handle deliberately.

The workflow used AI to help translate the assignment into a small HTML, CSS, and JavaScript application, then separate the simulation logic from the interface. The implementation includes preset examples, editable input, adjustable capacity, and status explanations. Automated checks exercise empty strings, exact-fit input, the extra terminator, longer input, and bounded-copy truncation. The README documents how to run and explore the module without installing dependencies.

An important lesson from reviewing this design is that a convincing diagram must still communicate its assumptions. The displayed stack layout is simplified, and real out-of-bounds writes in C have undefined behavior. The simulation should not suggest that every compiler arranges memory identically or that corruption always produces a predictable result. AI can accelerate implementation and suggest useful examples, but checking those assumptions and understanding the boundary cases remains essential.
