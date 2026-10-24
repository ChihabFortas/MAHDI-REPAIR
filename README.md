# Mahdi Repair
is a complete management app for a phone repair workshop. It runs as a static site on GitHub Pages, with Firebase Authentication and Firestore as the backend.

- Workshop: repair tickets with a “received with” checklist, repair levels 0–3, technician assignment and tablet dashboard, price-change approvals, returns after repair and returns without repair, plus a live dashboard with status cards.
- Customers: receipt QR tracking page with star ratings, WhatsApp/SMS notifications, and a CRM dashboard.
- Inventory: parts and accessories by phone model, images, storage locations (shelves and drawers), stock counts, merging, movement and price analysis, and a parts queue.
- Sales and purchasing: POS, returns, supplier orders and payments, and proforma, sales and purchase invoices.
- Finance: cash registers, expenses, losses, daily closing and profit statistics.
- Security: roles for reception, technician, inventory, manager and admin, with an audit log.

The interface is available in English, French and Arabic, with light and dark modes and several styles.


# Mahdi Repair – setup
1. Firebase console: create project > add Web app > copy config into `firebase-config.js`.
2. Build > Authentication > enable Email/Password; add your staff users.
3. Build > Firestore Database > create; paste `firestore.rules` in Rules tab and Publish.
4. Edit `SHOP` in `firebase-config.js` (name, phone, and the public URL of `track.html`).
5. Push all files to a GitHub repo > Settings > Pages > deploy from main branch (root).
6. Add your GitHub Pages domain in Firebase > Authentication > Settings > Authorized domains.
Printing: in the print dialog choose the Citizen CT-S300II, margins None, scale 100%; set paper size to match (80x50 / 45x35 mm) in the printer preferences once.

# Inventory
- Re-publish `firestore.rules` (new collections: parts, movements, receivings, deliveries).
- Put the owner's login email(s) in `ADMINS` in `firebase-config.js`: only they see the special price.
- Import: Inventory > Import (Excel/CSV, template included). Then use "Parts & quote" on any ticket.

# Quote-first flow
Dashboard > New quote: type the model, click OK, pick a part card, add compatible inventory items and services, then "Customer approved – submit" to create the ticket (parts stay "quoted"; technician uses them from "Parts & quote" to deduct stock) and print the receipt.

# POS
- Re-publish `firestore.rules` (adds products, customers, payments).
- Accessories live in their own collection (`products`), separate from repair parts. Stock in: Inventory › Receiving note (accessories and parts both appear in the line picker). Stock out: POS or Delivery note.
- POS sales are saved as delivery notes (`deliveries`, source `pos`). Customer debt = delivery-notes total − amounts paid at sale − payments received.

# Demo data and catalogs
- `seed.html` (open while signed in): loads demo parts, accessories, customers, tickets and POS sales; "Remove demo data" deletes only them.
- `data/`: phone-models.csv (320 models), part-types.csv (18 replaceable parts, no main board/ICs), accessories.csv (import in POS › Accessories), parts-sample.csv (import in Inventory › Import), plus all in repair-desk-catalog.xlsx.

# Images, languages, settings
- Part and accessory images: upload, take a photo (phones), or paste a link. Photos are shrunk to ~240 px and stored inside the part record (no Firebase Storage needed). Shown in Inventory, POS and both quote pages.
- Languages: English, French, Arabic (RTL) via the EN/FR/AR switch in every header or Settings. Translations live in the `RAW` list in `ui.js`: add a line `English|French|Arabic` to translate more text.
- `settings.html`: language, theme (Light / Calm / Dark), accent colour, text size, Easy view, currency (symbol, position, decimals). Saved per device. The customer tracking page shows prices in the currency the shop used when the quote was saved.
- New files: `ui.js`, `settings.html`.

# Roles and security (AAA)
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

# Price levels, POS, Brands
- Price levels per product: retail, wholesale, repair price, price 3 (blank = falls back to the normal price). POS has a price-level selector and a Repair-price toggle; quotes use the repair price when set.
- Brand on parts and accessories; POS filters by family, brand, location and stock; margin % column for managers.
- POS: held sales (save/resume, shared between computers), cash / card / transfer / on-credit payment, seller on each sale, F1 new sale, F3 complete, F8 hold, F9 customer, F12 repair price.
- Re-publish firestore.rules (adds heldSales). Import files accept optional repair, price3 and brand columns.

# Treasury 
- Registers: several cash registers / bank accounts with a journal (cash in, cash out, running balance), transfers between registers. First visit: click "Create default registers" (Day register is the POS default).
- Automatic entries: POS cash sales and customer payments go into the default cash register; cash expenses go out of the register you pick.
- Expenses: type, sub-type, category, supplier, payment mode, amount excl. tax / VAT / stamp / total, register, "administrators only" flag.
- Losses: pick a product, quantity and cost; stock is reduced automatically (deleting a loss puts it back).
- Daily closing: opening, cash in/out, expected closing, counted cash, gap, observations; lock the day (only admin can unlock); day summary of sales, payments, expenses, losses and purchases.
- Manager overview now shows cash in registers, expenses and losses for the month.
- Re-publish firestore.rules (adds registers, cashEntries, expenses, losses, dayClosings).

# Statistics
- Table by day, month or year over a chosen period: purchases, POS and delivery sales, repair revenue, total sales, expenses, losses, inventory gap, gross profit and net profit with percentages; totals row; export to Excel; print / PDF.
- Gross profit = sales - cost of goods sold (POS lines use the buy price at the time of sale; repair parts use the buy price when the part is marked "Use"). Net profit = gross - expenses - losses - inventory gaps (manual stock adjustments valued at buy price). Repairs count when the ticket is returned.
- Depreciation is not tracked yet. Tickets whose parts were used before this version fall back to the current buy price.

# Suppliers and returns
- `suppliers.html` (manager, admin): supplier list with balance due, statement per supplier (receiving notes, payments, returns), pay a supplier (cash out of a register), return goods to a supplier (stock out, credit note, optional cash refund).
- Receiving notes (Inventory): supplier name autocompletes from the supplier list; "Paid now" + register records the payment automatically.
- POS > Returns: sales returns / credit notes. Stock goes back, and the amount is credited to the customer account or refunded in cash from the default register. Customer debt and the profit statistics take returns into account.
- Re-publish firestore.rules (adds suppliers, supplierPayments, returns).

# Mobile view, login fix, fixed price
- Mobile: header scrolls sideways, tables become stacked cards on phones, dialogs go full-screen, bigger touch targets.
- Login: the app now waits for Firebase to restore the saved session before deciding, so a refresh stays on the same page (no bounce to the login screen).
- Prices are now wholesale, normal and repair only. The hidden "fixed price" = (normal + repair) / 2 is stored with each product and shown to admins only (Inventory, POS accessories, manager overview stock value). Special price (wholesale + normal) / 2 is unchanged (manager and admin).

# Purchase orders and invoices
- Suppliers > Orders: supplier purchase orders (numbered PO-year-0001), print for the supplier, receive goods fully or partly (creates the receiving note, adds stock, updates buy prices), cancel.
- `invoices.html`: proforma, sales invoices, credit-note invoices (reception, manager, admin) and purchase invoices / purchase credit notes (manager, admin). Numbers are sequential per type and year. Create manually or pick a source document (delivery note, sales return, receiving note, supplier return) to copy its lines. Optional VAT rate (prices are tax-inclusive), stamp duty and discount; A4 print; cancel (manager) or delete (admin).
- Invoices are documents only: they never change stock or balances (delivery notes, receiving notes and returns already do that).
- Re-publish firestore.rules (adds counters, purchaseOrders, invoices).

# Interface style, stock counts, product merging
- Settings > Interface style > "PME classic": menu bar (File, Stock, Purchases, Sales...), ribbon with General / Additional / Workshop tabs and big icons, status bar, grid tables with a blue selected row, coloured price columns (buy green, wholesale blue, repair purple, sale pink) and PME-style POS buttons and total. Menus follow each person's role. Hidden on phones (the ribbon stays). Switch back to "Modern" any time.
- `stockmgmt.html` (manager, admin): stock counts - create a count (all, accessories or parts; filter by family, brand, location), enter or scan quantities, see differences and value, print them, then validate to adjust the stock (movements are logged and count as inventory gaps in Statistics). Merge products - move stock to the kept item, remember the old barcode as an alias (scans and searches still find it), and re-point open tickets, held sales and open purchase orders. Past documents keep the old code as history.
- Re-publish firestore.rules (adds stockCounts).

# Repair levels, technician workflow, bonuses
- Reception sets a repair level (0 Basic, 1 Normal, 2 Difficult, 3 Most difficult) and assigns a technician when receiving a device (ticket form and New quote). Technician accounts are created by the admin (Admin panel > Users); they appear in the assignment list automatically.
- `technician.html` (tablet dashboard): a technician sees only devices assigned to them. Per device: change status, "Request parts", "New quote" (second quote with a note), "Mark repaired". Tabs: My devices, History (all devices received for them), My stats (repaired devices by level and estimated bonus).
- New quote: the ticket moves to "Waiting approval" and reception sees a 🔔 banner (with a beep) with old and new price. Reception marks "customer contacted" and approves (confirming the price, which also updates the customer tracking page) or rejects.
- Parts: requested parts go to the new Inventory staff role (`partsqueue.html`): they issue or decline. Stock is deducted only when the technician marks the device repaired; the technician is then credited with that repair at its level.
- Admin panel > Repair bonuses: amount per level, with optional per-technician overrides. `techreport.html` (manager, admin): month report per technician (devices by level, bonus), Excel and print.
- New role: Inventory (add users with this role in Admin panel). Re-publish firestore.rules (technician reads limited to their own tickets; adds technicians, settings).

# Returns after repair, return without repair, parts needed
- Reception > "Return after repair": type a name or phone, pick the device, choose Same problem / Another problem and write a note. A new ticket enters the normal flow, tagged as a return (links to the original ticket and remembers which technician repaired it). Tickets show a "Return" badge.
- Return without repair: the technician (Technician board > "Return without repair") or reception (price-change banner > "Customer declined") flags it as Unrepairable or a customer decision (high price, data loss, part unavailable, diagnosis only) with a note. New status "Return without repair"; reception hands it back (asks for an optional diagnosis fee, which is the only revenue counted for it). Requested parts are cancelled; issued parts show in the Parts queue to take back.
- Reports: Bonus report page now shows returns after repair per technician (with return rate) and returned-without-repair by reason; the manager overview shows monthly totals.
- Parts needed: a technician request for an out-of-stock part is flagged automatically; reception can add "Request a part". Inventory staff see a banner and a Parts needed tab (tick items, choose supplier, Create purchase order). Managers see a Parts needed list on the overview. When the purchase order is received the need is marked Received and reception gets a "Requested parts arrived" notification.
- Re-publish firestore.rules (adds partNeeds; inventory staff can read suppliers and create purchase orders).

# Received-with checklist, storage locations, live board, movement & analysis
- Reception (New ticket and New quote): "Received with" checklist - device type (smartphone / tablet / other); for smartphones: no SIM / 1 SIM / 2 SIM and SIM tray present; accessories: phone cover, plastic cover, SIM tray opener; charger present. Stored on the ticket (`device`), printed in short on the receipt, shown on technician cards and the live board.
- Storage locations: parts and accessories get a location code - Shelf S01-S36, Drawer D001-D300, Charging drawer C001-C300 (Inventory > Edit part, and POS > Accessories). "Next free" suggests the first empty number. The code shows as a badge wherever you search or pick a part (inventory, POS, quote pages, parts queue). `locations.html` (Storage map): grids of all shelves and drawers (green = used), "Find a part" highlights where it is, click a cell to see its contents, and print labels (A4 sheets of codes) to number the real shelves and drawers. A part can have several codes (e.g. "D045, S12").
- Live board (`board.html`) is now the default start page for reception, manager and admin: one long column per status; devices move to the next column as their status changes (highlighted), filter by technician, search, only-late; click a device for details, history and a status change.
- Part "Movement" button (Inventory and POS accessories): every purchase, delivery, POS sale, use in repair, return, loss, adjustment, merge, and also "issued to technician" / "taken back" with balance, reference, note and user. "Analysis" button (manager, admin): current and average buy price, last purchase, lowest/highest, last price per supplier, purchase price history with % change, price-change log (buy, wholesale, sale, repair), monthly in/out chart. Price changes are logged from now on (edits, receiving notes, purchase orders); purchase history is read from past receiving notes.
- Re-publish firestore.rules (adds priceLog).

# New interface (app shell, dashboard, styles, palettes)
- **App shell** (`app.html`, the page everyone lands on after login): dark sidebar with grouped menus filtered by role, top bar (quick New ticket, light/dark switch, language, sign out), and every page opens inside the same window in its own frame that stays alive - switching pages never reloads or loses what you were typing. Pages still work when opened directly. Phones: the sidebar becomes a slide-in menu.
- **POS full screen**: Sales > POS hides the sidebar and top bar (and asks the browser for full screen); only the POS fills the screen, with a small "Exit POS" button.
- **Dashboard** (`dashboard.html`, default for reception, manager, admin): clean stat cards (click one to filter the list), a donut of devices by status, devices by technician, received over 14 days, and the list of current repairs (or a Board view with one column per status). Clicking a device opens a card on top of the page, with status, technician and level you can change, the parts, the quote and the history, without leaving the page. Quick buttons: New ticket, New quote, Return after repair, Request a part.
- **Styles** (Settings > Interface style): Modern, iOS glass (frosted translucent cards, blurred gradient background, springy animations), Android 16 (tonal Material surfaces, pill buttons), PME classic. **Mode**: Light / Calm / Dark. **Color palette**: 8 clickable palettes (default Sky blue, the colour of your store site) plus a custom colour. Settings apply instantly across all open pages.
- **Colour coding**: the same status colours everywhere (grey reception, amber diagnose, purple waiting approval, brown waiting parts, blue repair, green ready, red late).

# Customer relationship (CRM)
- Receipt QR: the QR on the customer receipt (with the line "Scan to track") opens `track.html?code=...`. If `trackUrl` in firebase-config.js is not set, the page's own address is used automatically.
- Tracking page: when a repair is ready / returned, the customer can leave 1-5 stars and a comment (one rating per ticket, stored in `feedback`).
- WhatsApp / SMS: when a device is Ready for pickup (or returned without repair), reception rows and the dashboard detail card show WhatsApp and SMS buttons (and Copy message) that open the customer's chat with a ready-made message and tracking link; the ticket is marked notified. Admin panel > Customer messages: country code (so local numbers like 0555... become international), default customer language and the message templates ({name} {device} {shop} {link} {price} {code}). The dashboard has a "Ready - not notified" card.
- CRM dashboard (`crm.html`, manager and admin): customers served, repeat customers, returns after repair and rate, incomplete repairs by reason, completion rate, quote approval rate, average repair time, on-time delivery, average rating and distribution, review rate, customers notified, new vs repeat customers per month, per-technician repaired/returns/rating, top customers, latest comments.
- Re-publish firestore.rules (adds feedback).

# Navigation fix
- Fixed the app shell looping/refreshing on GitHub: every page called `setPersistence(...)` when it loaded, which moved the saved login between browser storages and signed the other open pages out, so the shell kept bouncing to the login page and back. That call is removed (the default persistence already keeps you signed in).
- A page now needs a confirmed sign-out (checked again after 1.5 s) before sending you to the login page, and the login page / shell refuse to load inside a frame.
- After uploading to GitHub, hard-refresh once (Ctrl+F5) so the browser drops the old cached scripts.

# Top bar and icons
- Fixed the blank buttons in the top bar: the menu and sign-out buttons were drawn in white on a white bar. They now use theme colours and clean line icons (menu, new ticket, light/dark, sign out). The sidebar icons are the same line-icon set instead of emoji, so they look identical on every phone.
- Phone layout: the top bar keeps the title visible, the "New ticket" button becomes a round "+" icon, and the stat cards on the dashboard and CRM pages show two per row.

# PME-style menu everywhere, settings Save, part editor
- The dark side menu is gone. A single top bar now holds the menus (Dashboard, File, Stock, Purchases, Sales, Workshop, Finance), your name and role, theme, language and sign out, with the PME-style toolbar (General / Additional / Workshop tabs) under it and a status bar at the bottom. The "▾" button hides or shows the toolbar. Menus open on hover and close when you click an item or move away (touch screens: tap). Phones: the ☰ button opens the same menus as a list.
- Any page opened directly (for example dashboard.html) is wrapped in this menu automatically, so the menus are always there. POS still goes full screen (Exit POS button).
- Settings: new Save bar. Changes preview instantly but are only stored when you press Save (Discard changes reverts).
- POS: the search box is cleared after you add an item, ready for the next one.
- New admin-only page: Stock > Part details editor. Browse every part and accessory (search, "not reviewed / no image / reviewed" filters, progress bar), fix the name (spelling hints and a Tidy button), reference, brand, type, quality (new "Copy" quality), model, compatible devices, location, notes, and upload or take a photo; Save & next writes it to the database and moves to the next one.

# One navigation bar
- The top header with drop-down menus and the tab buttons inside each page are gone. There is now a single PME-style toolbar: the tabs (Workshop, Stock, Purchases, Sales, Finance, System) share one row with your name, role, theme, language and sign out, and the big icon buttons below reach every page and every section (for example Stock: Parts catalog, Receiving notes, Delivery notes, Movements, Import; Sales: Counter sale, Sales journal, Returns, Customers & debts, the three invoice types; System: Settings, Users, Repair bonuses, Customer messages, Audit log, Access rights). The ▾ button hides the buttons row. Phones: ☰ opens the same list.
- Settings: the colour palette swatches show their colours in every interface style (they were hidden by the PME/glass/Android button styles).


# No in-page tab rows, cache-proof loading
- The tab row inside each page (Catalogue / Receiving notes / Delivery notes / Movements / Import and the equivalents in POS, suppliers, treasury, stock counts, invoices, admin, technician, parts queue) is now always hidden; the toolbar buttons open exactly the same sections.
- All scripts, styles and page frames now load with a version tag (`?v=24`), so after uploading to GitHub the browser can no longer keep showing old files. If you change files later, bump the number.

# Arabic receipts
- Customer receipt: 57 mm wide × 80 mm long, RTL Arabic, logo (`logo.svg`, replace with your own PNG/SVG and set `SHOP.logo`), shop name/phone/address (`firebase-config.js` → `SHOP.address`), QR tracking, footer note.
- Workshop ticket: 45 × 35 mm — Tel, name, device, fault, CODE128 barcode, date.
- In the print dialog choose the matching paper size once (57×80 mm / 45×35 mm), margins none.

# Catalog builder (admin, mobile-friendly)
`catalog.html` (Stock → Catalog builder): goes through parts/accessories one by one; add photos (camera, gallery or screenshot), title, brand, category, product type (OEM / Original / Third party / Copy / Refurbished), colour, short + full description, compatible devices, warranty, tags, publish flag. Saved under `shop{…}` on the part/product document and marked `shop.done`; only unfinished items remain in the queue. Daily goal (default 20, editable with 🎯, stored in `settings/catalog`) shown as a progress ring and as a widget on the admin dashboard. Photos (≤5, 900 px) are stored inside the document, ready to feed a future e-commerce site.

# Online shop
- `shop.html` (+ `shop.js`): public storefront (EN/FR/AR, light/dark): landing page, search with suggestions, filters (category, brand, type, price, in stock), sorting, product pages, cart drawer, checkout as guest or with an account (Firebase email/password), cash on delivery, order tracking by code, customer account with order history and status timeline.
- `orders.html` (Sales → Online orders): staff receive orders (beep + dashboard banner), call/WhatsApp the customer, **Confirmed by phone → Start preparing (stock is deducted) → Add tracking number → Sent → Delivered**; cancel restocks. Admin: shop settings (delivery fee, free-delivery threshold, phone, announcement) and "Sync shop catalog".
- `shopsync.js`: publishes sanitised copies (normal selling price, quantity, photos, description — never buy/wholesale prices) into `shopItems` / `shopDetails`. Items finished in the Catalog builder are published automatically; stock changes update `shopItems.qty` automatically.
- **Deploy**: publish the new `firestore.rules`; in Firebase Auth enable Email/Password and add your GitHub Pages domain to *Authorized domains*; open Online orders → Sync shop catalog.

# Catalog by brand
Stock → Parts catalog now opens on **brands** (Samsung, Apple, Xiaomi, …) → click a brand to see its **phones and tablets** as photo cards → click a model to see its parts (parts whose *compatible devices* list includes that model are shown too). Admin can set a phone photo with the 📷 button (stored in `settings/modelPhotos`); otherwise the photo of a part for that model is used. New search filters: part type, quality, stock (in / low / out), max sale price, plus search by reference, location and compatible device. Brand/model detection uses `data/phone-models.csv`.

# Shop sign-in
Clear sign-in errors, Google sign-in (Facebook optional via Online orders → Shop settings). Firebase console: Authentication → Sign-in method → enable Email/Password and Google (Facebook needs a Facebook app ID/secret); Authentication → Settings → Authorized domains → add your GitHub Pages domain (e.g. yourname.github.io).

# Order editing
Online orders: ✎ Edit order (change items, quantities, prices, customer/address, delivery fee; add items from the catalog; stock is adjusted automatically if already reserved), ⏸ Waiting for stock, 🗑 Delete (manager/admin), + New order (phone/walk-in). Each change can carry a message that appears on the customer's tracking page with an "Order modified" badge. Re-paste the updated shop block of `firestore.rules`.

# Customer history
`customers.html` (Sales → Customers & debts): search customers by name/phone; click one to see the full ledger by date (invoices, payments, returns) with a running balance starting from zero. Add / edit / remove payments; open any invoice to change items, prices, quantities, discount, paid amount or delete it (stock and cash register follow), and the history recalculates. Rules: `payments` and `deliveries` update/delete now allowed for manager/admin.

# Redesigne POS interface
- Fixed blank POS in full-screen mode (shell grid row).
- POS redesigned: search-first left panel with category chips, big product tiles; right ticket with +/- qty, big total, payment buttons, quick cash tender + change due, large Complete button. Shortcuts: F1 new, F2 search, F3 complete, F8 hold, F9 customer, F12 repair price.
