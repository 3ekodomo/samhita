# Ayurveda Chapter Index — Static GitHub Pages Build

This repository is configured as a static Vite + React website.

## Runtime architecture

- Chapter/shloka data is bundled from `artifacts/ayurveda-reader/src/data/library.json`.
- `static-library.ts` reads that local JSON; there is no runtime API/database dependency.
- Hash routing is used, so GitHub Pages does not need server-side route rewrites.
- The GitHub Actions workflow builds the site and deploys `artifacts/ayurveda-reader/dist/public`.

## Build

```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/ayurveda-reader run typecheck
pnpm --filter @workspace/ayurveda-reader run build
```

The deployable static files are generated in:

`artifacts/ayurveda-reader/dist/public`

## GitHub Pages

Push the repository to GitHub and enable **Settings → Pages → Source: GitHub Actions**.
The workflow in `.github/workflows/deploy-pages.yml` will build and deploy the site on pushes to `main`.

The workflow supplies the repository name as Vite's `BASE_PATH`, so the project works at a normal GitHub Pages project URL.

## Important

Do not add a backend/API requirement for chapter content. Keep all Sanskrit shlokas in the local static data file so the deployed site remains self-contained.
