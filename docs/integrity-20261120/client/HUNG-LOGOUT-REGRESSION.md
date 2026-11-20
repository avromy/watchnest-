# Hung logout regression addition

Controller subsequently added a logout-only AbortController15second deadline and optional API signal. This reviewer added a fourth browser regression; no production source changes made in this follow-up.

The test uses the actual browser AbortController/fetch and application timer under Playwright clock advancement, with the first synthetic logout request held. It verifies pending disabled state, advances15001ms, checks the exact honest error and retry enabled while URL remains Settings, then retries successfully and checks login navigation, exactlytworequests and no pageerror events. It records pending and timeout screenshots at390×844 and820×1180 in test.info output artifacts with image attachments.

Files named logout-pending-390.png, logout-pending-820.png, logout-timeout-390.png, logout-timeout-820.png. Controller owns rebuilt candidate execution and result evidence. This addition does not claim a green result or physical iOS/Safari behavior before that run. Scoped testfile eslint passed.
