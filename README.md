# WASM — Static Frontend

This folder is a frontend-only rebuild of the original ASP.NET project.

## Stack
- HTML
- CSS
- Vanilla JavaScript
- Local image assets

There is no C#, .NET, API server, npm dependency, or build step.

## Vercel
Import this folder as a Vercel project. Use **Framework Preset: Other** and leave the Build Command empty. The site is served directly from the project root.

## Checkout
The original `/api/orders` flow has been replaced with client-side validation and a local demo receipt stored in `localStorage`, because a frontend-only static deployment has no server-side order database or payment processor.

The original mobile UI reference screenshots are preserved under `reference/`; all website images under `assets/` are byte-for-byte unchanged.
