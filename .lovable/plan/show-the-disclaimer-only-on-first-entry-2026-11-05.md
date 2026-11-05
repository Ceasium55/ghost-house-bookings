# Show the disclaimer only on first entry

## Why it reappears today
The Credits and Manager Access buttons are plain links that reload the whole website. Each reload resets everything, so both the loading screen and the disclaimer show again.

## Change
- When a visitor ticks the box and clicks Continue, remember it for the current browser tab session.
- On later page changes or reloads in the same tab: show the loading screen only, then the page. No disclaimer.
- A new visit (a new tab or after closing the browser) shows the disclaimer again.

## Technical details
- `src/App.tsx`: start `accepted` from `sessionStorage.getItem("disclaimerAccepted") === "1"`; in `handleAccepted`, set that key before updating state.
- The loading screen stays on every full page load, as requested.
