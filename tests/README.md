# Motion regression checks

Install Playwright in your development environment (`npm install --no-save --package-lock=false playwright`), then run `node tests/motion.cjs`. The suite uses installed Chrome by default; set `BROWSER_CHANNEL=msedge` to use Edge. No production dependencies or build step are required.

Checks cover desktop (1440/901px), the mobile breakpoint (900px), phone widths (390/320px), rapid menu reversal, keyboard focus and Escape, resizing, anchor offsets, outside clicks, short screens, touch hover, live reduced-motion changes, no-JavaScript navigation, and shared navigation on the other three pages. Set `SCREENSHOT_DIR` to an existing directory to capture full-page desktop and phone screenshots.

These are Chromium checks against local static files, not physical iOS/Safari or production deployment tests.
