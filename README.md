<<<<<<< HEAD
# WHAT IF...? The Overthinking Machine

![alt text](<Screenshot 2026-09-12 090407.png>)

A chaotic little overthinking simulator where a harmless thought spirals into absurd levels of paranoia, comedy, and completely useless mini-games.

The app pairs a React + Vite frontend with an Express backend and optional Gemini AI generation. It starts with a dramatic input prompt, creates escalating spiral thoughts, and then drops the user into five intentionally stupid experiments that reward confusion and bad decisions.

## Features

- Dramatic overthinking prompt flow
- 5 increasingly ridiculous spiral rounds
- AI-generated thoughts via Gemini when configured
- Contextual fallback logic when AI is unavailable or slow
- Five useless games:
  - Button That Does Nothing
  - Catch the Chair
  - Don't Move Your Mouse
  - The Impossible Checkbox
  - Useless Driving Simulator
- Sound effects and playful UI treatment
- GitHub Pages-friendly build output

## Tech Stack

- React 19
- Vite
- TypeScript
- Express server
- Gemini API integration via Google GenAI
- Tailwind styling

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Environment setup

Create a local environment file and add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

If you do not provide a key, the app still works using its built-in contextual fallback generator.

### Run locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
```

This produces a production bundle and server build for deployment.

## GitHub Pages Deployment

The app is configured to emit a Pages-compatible build into the `docs` directory. After building, push the repository and set GitHub Pages to serve from the `docs` folder.

```bash
npm run build
```

Then publish from:

```text
main / docs
```

## Project Structure

```text
src/
  App.tsx
  components/
  data/
  utils/

public/
  favicon.ico
  favicon.svg
  sounds/

server.ts
vite.config.ts
package.json
```

## Notes

This project is intentionally absurd, playful, and slightly hostile to common sense. The goal is to make the user feel like they are spiraling into a niche digital existential crisis while pressing buttons that should not matter.

---

If you want, I can also add a short screenshot section or a deployment workflow for GitHub Actions.
=======

>>>>>>> d555e735744d6a9af58c04e2e15285e29dab4941
