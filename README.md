# Repair Desk v2 – setup
1. Firebase console: create project > add Web app > copy config into `firebase-config.js`.
2. Build > Authentication > enable Email/Password; add your staff users.
3. Build > Firestore Database > create; paste `firestore.rules` in Rules tab and Publish.
4. Edit `SHOP` in `firebase-config.js` (name, phone, and the public URL of `track.html`).
5. Push all files to a GitHub repo > Settings > Pages > deploy from main branch (root).
6. Add your GitHub Pages domain in Firebase > Authentication > Settings > Authorized domains.
Printing: in the print dialog choose the Citizen CT-S300II, margins None, scale 100%; set paper size to match (80x50 / 45x35 mm) in the printer preferences once.

## v2 – Inventory
- Re-publish `firestore.rules` (new collections: parts, movements, receivings, deliveries).
- Put the owner's login email(s) in `ADMINS` in `firebase-config.js`: only they see the special price.
- Import: Inventory > Import (Excel/CSV, template included). Then use "Parts & quote" on any ticket.

## v3 – Quote-first flow
Dashboard > New quote: type the model, click OK, pick a part card, add compatible inventory items and services, then "Customer approved – submit" to create the ticket (parts stay "quoted"; technician uses them from "Parts & quote" to deduct stock) and print the receipt.

## v4 – POS
- Re-publish `firestore.rules` (adds products, customers, payments).
- Accessories live in their own collection (`products`), separate from repair parts. Stock in: Inventory › Receiving note (accessories and parts both appear in the line picker). Stock out: POS or Delivery note.
- POS sales are saved as delivery notes (`deliveries`, source `pos`). Customer debt = delivery-notes total − amounts paid at sale − payments received.

## v5 – Demo data and catalogs
- `seed.html` (open while signed in): loads demo parts, accessories, customers, tickets and POS sales; "Remove demo data" deletes only them.
- `data/`: phone-models.csv (320 models), part-types.csv (18 replaceable parts, no main board/ICs), accessories.csv (import in POS › Accessories), parts-sample.csv (import in Inventory › Import), plus all in repair-desk-catalog.xlsx.

## v6 – Images, languages, settings
- Part and accessory images: upload, take a photo (phones), or paste a link. Photos are shrunk to ~240 px and stored inside the part record (no Firebase Storage needed). Shown in Inventory, POS and both quote pages.
- Languages: English, French, Arabic (RTL) via the EN/FR/AR switch in every header or Settings. Translations live in the `RAW` list in `ui.js`: add a line `English|French|Arabic` to translate more text.
- `settings.html`: language, theme (Light / Calm / Dark), accent colour, text size, Easy view, currency (symbol, position, decimals). Saved per device. The customer tracking page shows prices in the currency the shop used when the quote was saved.
- New files: `ui.js`, `settings.html`.
