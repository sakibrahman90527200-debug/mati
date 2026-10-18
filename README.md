# মাটি / Mati

LandTech 2026 P6 prototype: a citizen land workspace with a “Review before you pay” service backed by a hosted Cloudflare D1 registry of twenty fictional land cases.

## Current experience

The main website is the full workspace: profiles, map, document review, record explorer, advisor preview, glossary and simulated office workflow. “Review before you pay” appears in the sidebar and the homepage. It opens `/review.html`, where a user chooses any of twenty generated offer documents, reviews the extracted fields and asks the server to check the stored transaction ledger.

Results distinguish `already_sold`, `partly_sold`, `no_sale_conflict`, and `needs_review`. They apply to the offered seller's remaining recorded share, not merely whether any sale ever occurred on that parcel. The server returns prior sale dates, buyer references, transaction references and remaining area when supported. A legitimate resale by the current holder is a control case. An old or incomplete record requires review. No result certifies title or safety to buy.

The previous three-minute story remains available at `/story.html`. Its police handoff is a simulation. No real complaint, police notification, arrest or government mutation occurs.

## Architecture and data

- Vinext / Vite server using the supplied Sites starter and its `sites()` build integration.
- Cloudflare D1 bound as `DB` through `.openai/hosting.json`.
- `land_records` stores the twenty canonical fictional records and their offered-document references as JSON payloads; `registry_meta` stores the seed version.
- `data/registry-seed.json` is a bundled synthetic seed. It is inserted once with an authenticated, same-origin POST; `INSERT OR IGNORE` makes initialization idempotent and preserves existing records.
- Schema-only migration: `drizzle/0000_clear_psynapse.sql`. Seed records are not inserted in a migration.
- `GET /api/registry` reads the database. `POST /api/registry/check` loads a record from D1 and computes the result on the server. Client claims about sale status or remaining share are ignored.
- The platform owns hosted sign-in. API routes check the dispatch identity; the Site retains its owner-private audience. The initialization POST and check POST enforce same origin. SQL parameters are bound.
- The browser has no static/local fallback for a registry check. An unavailable server produces an error, not a guessed purchase result.

The frontend files live in `public/`. The root opens the main workspace; `/workspace.html` is also directly available. `public/index.html` and `public/workspace.html` deliberately share the same workspace shell. Keep them synchronized when changing its navigation.

## Run and build

Node >=22.13 is required. Install through the Sites plugin's `install-dependencies.mjs` helper. The Windows npm launcher workaround used for this workspace is under ignored `.sites-runtime/bin`; it contains no credentials.

Generate fixtures: `python scripts/generate_samples.py`, then `python scripts/generate_registry.py`. The first updates the base synthetic cases and source pages under `public/`; the second produces the server seed and twenty offered-document pages. The separate story fixtures use `python scripts/generate_story.py`.

Build through the Sites plugin's `build-site.mjs` helper. The server artifact is `dist/server` and static assets are `dist/client`.

For a fresh local preview, apply the generated schema once after building:

`node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_clear_psynapse.sql`

Start with `npm run dev`. Portable development provides the starter's local-only sign-in simulation. Follow the displayed Sign in link; this uses `seedy@sites.test` locally and is absent from production. The first authenticated workspace load initializes the twenty synthetic records if the registry is empty. Local and hosted databases are separate. Sites applies hosted schema migrations during publication.

## Validation

- `node scripts/check-registry.mjs`: checks all twenty sale outcomes, reviewed-field gating, altered document fields and attempts to inject a fake client sale status.
- `node scripts/check.cjs`: original fixture relationships, integrity hashes and explainable record checks.
- `node scripts/check-story.cjs`: fictional story and simulated handoff checks.
- JavaScript syntax checks for `public/registry-client.js`, `public/registry-review.js`, `public/app.js` and `public/mati.js`.
- Local authenticated HTTP tests exercised all twenty actual database-backed checks: 3 already sold, 2 partly sold, 5 no sale conflict, and 10 needing review. Anonymous registry access returned 401.

## Prototype limits

All people, identifiers, documents, locations, boundaries, transfers and office flags are fictional. No real NIDs or phone numbers are used. The D1 registry is real hosted storage for this fictional data; it is not a government registry and is not claimed to be nationally complete.

OCR fields are pre-generated. No live OCR or LLM is connected. The advisor remains scripted. The broader workspace's demo persona selector is not proof of ownership; current hosting access is owner-private. Any future real-data use requires record-level authorization, private uploads and authorized source integration.

The server ledger checks are bounded demonstrations, not complete legal adjudication. Partly sold shares do not define physically separate boundaries. The map polygons are illustrative and recorded areas are independent fixture values. File hashes compare a sample to a stored baseline; they do not authenticate the original issuer.

The simulated office queue and its edits remain session-local and do not update D1 or government records. Purchase checks always use the stored D1 record, so a browser-only field/status edit in another tool cannot overwrite a sale decision.

## Credits and event context

AI tool: OpenAI Codex for concept development, code, synthetic fixtures and implementation assistance. No model is called by the running prototype. Fonts: Google Fonts Manrope, DM Sans, Noto Sans Bengali and Noto Serif Bengali with local fallbacks. Icons and illustrations are authored SVGs.

The supplied LandTech 2026 rulebook v1.2 permits dummy data and AI tools with disclosure. P6 acceptance remains subject to the organizers. No government scraping or live-system testing is performed. The three-minute script is `docs/three-minute-demo-script.md`; it is a script, not a rendered video. Team/mentor details, the final concept-note PDF and the separate judging rubric are not supplied here.
