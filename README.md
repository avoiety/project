# moodrobe

`moodrobe` is a personal wardrobe app that recommends an outfit from the clothes you register.

## Features

- Register, edit, and remove wardrobe items with photos
- Filter outfits by weather and occasion
- Select the highest-scoring top, bottom, and shoe combination with a weighted compatibility graph
- Store a nickname, PIN hash, profile character, and wardrobe locally in IndexedDB
- Customize a pixel-style wardrobe companion

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Local account notice

The app is browser-only. The PIN itself is not stored; a salted SHA-256 hash is stored in IndexedDB. Data remains only in the browser where it was created, and clearing site data removes the local account and wardrobe.
