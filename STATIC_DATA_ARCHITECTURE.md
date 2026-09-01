# Static data architecture

The original ~11 MB `library.json` has been removed from the runtime bundle.

- `artifacts/ayurveda-reader/src/data/library-index.json` contains only metadata used by the library page.
- `artifacts/ayurveda-reader/public/data/chapters/*.json` contains one chapter's full text per file.
- `artifacts/ayurveda-reader/public/data/sections/*.json` contains lightweight section manifests and chapter file mappings.
- Opening the library does not download chapter text.
- Opening a chapter fetches only that chapter JSON from GitHub Pages.
- The URL uses Vite's `BASE_URL`, so it works when deployed under a repository path.

The site remains fully static: no API server or database is required.
