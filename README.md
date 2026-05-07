# Tight Lines — UK Fishing Guide

A mobile-first React/Vite fishing information app for UK anglers, focused on Kent venues.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build for Netlify

```bash
npm run build
```

Upload the generated `dist/` folder to Netlify, or connect via GitHub (see below).

## Deploy to Netlify

### Option A — Drag & Drop (fastest)
1. Run `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag the `dist/` folder onto the deploy area
4. Done

### Option B — GitHub CI (recommended)
1. Push this repo to GitHub
2. New site → Import from GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

The `netlify.toml` handles all routing automatically.

## Project Structure

```
tight-lines/
├── src/
│   ├── data/
│   │   ├── fishSpecies.js   8 UK species
│   │   ├── lakes.js         7 Kent venues
│   │   ├── swims.js         7 named hotspots with rig advice
│   │   ├── records.js       10 British records
│   │   └── conditions.js    Temp/wind/season/pressure guide
│   ├── components/
│   │   ├── AppHeader.jsx
│   │   ├── BottomNav.jsx
│   │   └── UI.jsx           Shared Badge, InfoRow, DetailSection, etc.
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Fish.jsx
│   │   ├── Lakes.jsx
│   │   ├── Conditions.jsx
│   │   ├── Records.jsx
│   │   └── Search.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   ├── manifest.json
│   ├── _redirects
│   └── favicon.svg
├── netlify.toml
└── vite.config.js
```

## Adding Data

All data is plain JS arrays/objects in `src/data/`. Edit directly — no database needed.

- **New lake**: Add an object to `lakes.js` following the existing shape
- **New species**: Add to `fishSpecies.js`  
- **New swim**: Add to `swims.js`, match the `lakeId` to a lake's `id`
- **New record**: Add to `records.js`

## Tech Stack

- React 18 + Vite
- CSS Modules (no Tailwind, no UI library)
- Google Fonts (Playfair Display + Source Sans 3)
- Zero runtime dependencies beyond React
