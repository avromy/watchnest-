# Visual evidence, 2026-09-30

These PNGs capture actual Chromium rendering of the built app with browser-only **synthetic API fixtures**, not a deployed or authenticated family. Fixture thumbnails are deliberately empty. They are limited layout/state evidence and must not be used as proof of real YouTube metadata, family accounts, analytics, persistence, Safari behavior or full visual acceptance.

Reproduce: `npm ci`, `npm run build`, `npm run test:e2e`. `e2e/visual.spec.ts` captures desktop parent overview/children, landscape tablet child standard and portrait tablet child simple. A separate viewport test covers390/768/1024 widths.
