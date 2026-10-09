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

## v7 – Mahdi Repair, roles and security (AAA)
Shop name is now "Mahdi Repair" (`SHOP.name` in firebase-config.js).

**First-time setup**
1. In `firebase-config.js` put your email in `ADMINS`, and put the same email in the `isOwner()` list at the top of `firestore.rules`. Publish the rules.
2. Firebase console > Authentication: create that user (email + password).
3. Open the site and sign in: the owner account becomes **admin** automatically.
4. Admin panel > Users > "+ Add staff": create reception, technician and manager accounts. Staff without a role (or disabled) cannot enter.

**Roles and dashboards** (`index.html` is the login and sends each person to theirs)
- Reception: `reception.html` (tickets, new quote, POS, customers, payments; inventory read-only).
- Technician: `technician.html` (repair board, request/use parts, update status).
- Manager: `manager.html` (KPIs, stock alerts, debts, activity) plus all operations and inventory management.
- Admin: `admin.html` (users, roles, enable/disable, password reset, audit log, access table) plus everything else.

**AAA**
- Authentication: Firebase email/password, password reset, automatic sign-out after `IDLE_MINUTES` of inactivity.
- Authorization: enforced by `firestore.rules` on the server (the pages also hide what a role cannot use).
- Accounting: every login, ticket change, sale, payment and user change is written to the audit log; stock movements are logged too.

## v8 – PME Pro step 1 (shop name: Mahdi Repair)
- Price levels per product: retail, wholesale, repair price, price 3 (blank = falls back to the normal price). POS has a price-level selector and a Repair-price toggle; quotes use the repair price when set.
- Brand on parts and accessories; POS filters by family, brand, location and stock; margin % column for managers.
- POS: held sales (save/resume, shared between computers), cash / card / transfer / on-credit payment, seller on each sale, F1 new sale, F3 complete, F8 hold, F9 customer, F12 repair price.
- Re-publish firestore.rules (adds heldSales). Import files accept optional repair, price3 and brand columns.

## v9 – PME Pro step 2: treasury (`treasury.html`, manager and admin)
- Registers: several cash registers / bank accounts with a journal (cash in, cash out, running balance), transfers between registers. First visit: click "Create default registers" (Day register is the POS default).
- Automatic entries: POS cash sales and customer payments go into the default cash register; cash expenses go out of the register you pick.
- Expenses: type, sub-type, category, supplier, payment mode, amount excl. tax / VAT / stamp / total, register, "administrators only" flag.
- Losses: pick a product, quantity and cost; stock is reduced automatically (deleting a loss puts it back).
- Daily closing: opening, cash in/out, expected closing, counted cash, gap, observations; lock the day (only admin can unlock); day summary of sales, payments, expenses, losses and purchases.
- Manager overview now shows cash in registers, expenses and losses for the month.
- Re-publish firestore.rules (adds registers, cashEntries, expenses, losses, dayClosings).

## v10 – PME Pro step 3: statistics (`statistics.html`, manager and admin)
- Table by day, month or year over a chosen period: purchases, POS and delivery sales, repair revenue, total sales, expenses, losses, inventory gap, gross profit and net profit with percentages; totals row; export to Excel; print / PDF.
- Gross profit = sales - cost of goods sold (POS lines use the buy price at the time of sale; repair parts use the buy price when the part is marked "Use"). Net profit = gross - expenses - losses - inventory gaps (manual stock adjustments valued at buy price). Repairs count when the ticket is returned.
- Depreciation is not tracked yet. Tickets whose parts were used before this version fall back to the current buy price.

## v11 – PME Pro step 4 (part 1): suppliers and returns
- `suppliers.html` (manager, admin): supplier list with balance due, statement per supplier (receiving notes, payments, returns), pay a supplier (cash out of a register), return goods to a supplier (stock out, credit note, optional cash refund).
- Receiving notes (Inventory): supplier name autocompletes from the supplier list; "Paid now" + register records the payment automatically.
- POS > Returns: sales returns / credit notes. Stock goes back, and the amount is credited to the customer account or refunded in cash from the default register. Customer debt and the profit statistics take returns into account.
- Re-publish firestore.rules (adds suppliers, supplierPayments, returns).

## v12 – mobile, login fix, fixed price
- Mobile: header scrolls sideways, tables become stacked cards on phones, dialogs go full-screen, bigger touch targets.
- Login: the app now waits for Firebase to restore the saved session before deciding, so a refresh stays on the same page (no bounce to the login screen).
- Prices are now wholesale, normal and repair only. The hidden "fixed price" = (normal + repair) / 2 is stored with each product and shown to admins only (Inventory, POS accessories, manager overview stock value). Special price (wholesale + normal) / 2 is unchanged (manager and admin).

## v13 – PME Pro step 4 (part 2): purchase orders and invoices
- Suppliers > Orders: supplier purchase orders (numbered PO-year-0001), print for the supplier, receive goods fully or partly (creates the receiving note, adds stock, updates buy prices), cancel.
- `invoices.html`: proforma, sales invoices, credit-note invoices (reception, manager, admin) and purchase invoices / purchase credit notes (manager, admin). Numbers are sequential per type and year. Create manually or pick a source document (delivery note, sales return, receiving note, supplier return) to copy its lines. Optional VAT rate (prices are tax-inclusive), stamp duty and discount; A4 print; cancel (manager) or delete (admin).
- Invoices are documents only: they never change stock or balances (delivery notes, receiving notes and returns already do that).
- Re-publish firestore.rules (adds counters, purchaseOrders, invoices).

## v14 – interface style, stock counts, product merging
- Settings > Interface style > "PME classic": menu bar (File, Stock, Purchases, Sales...), ribbon with General / Additional / Workshop tabs and big icons, status bar, grid tables with a blue selected row, coloured price columns (buy green, wholesale blue, repair purple, sale pink) and PME-style POS buttons and total. Menus follow each person's role. Hidden on phones (the ribbon stays). Switch back to "Modern" any time.
- `stockmgmt.html` (manager, admin): stock counts - create a count (all, accessories or parts; filter by family, brand, location), enter or scan quantities, see differences and value, print them, then validate to adjust the stock (movements are logged and count as inventory gaps in Statistics). Merge products - move stock to the kept item, remember the old barcode as an alias (scans and searches still find it), and re-point open tickets, held sales and open purchase orders. Past documents keep the old code as history.
- Re-publish firestore.rules (adds stockCounts).
