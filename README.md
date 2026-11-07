# SmartPOS

Next.js + React + TypeScript + Tailwind CSS. Run `npm install` and `npm run dev`; `npm run build` exports the demo to `out`.

Run `npm test` for the peso calculation, sample receipt reconciliation, report period boundary, and export tests. The static export can be hosted without a Node server or database. Product photos load from Unsplash; if an image is unavailable, a product icon is shown instead.

## Client showcase demo

The app runs entirely in the browser and needs no Supabase account or backend. All amounts use Philippine pesos (PHP / ₱), with realistic sample prices. No additional tax is applied; this is an illustrative store, not a tax or fiscal receipt implementation.

- Register: product/SKU search, categories, stock-limited cart, fixed peso discounts, cash tender and change, simulated card checkout, printable and downloadable itemized receipts.
- Inventory: add/edit products, unique SKUs, units, stock thresholds, reasoned stock adjustments, low/out-of-stock filters, archive and restore. Previous receipts preserve the product names and prices at the time of sale.
- Overview and reports: daily/monthly period selection, accurate totals and averages, historical trends, best sellers, paginated receipts, and filtered CSV export in PHP.
- Team: create/edit demo identities, activate/deactivate them, and switch between Admin and Cashier previews. The current administrator cannot deactivate or demote themselves. Cashiers can sell and view inventory; management screens require the Admin preview.
- Audit: searchable, filterable activity history for sales, stock, products, and team changes.
- Demo guide, keyboard search shortcut (Ctrl/Cmd+K), accessible dialogs, responsive layouts, image fallbacks, and a reset flow in Store settings.

Demo state is saved under `smartpos-showcase-php-v3` in local storage, separate from the original dollar demo. Visitors using different browsers have independent sample stores. Use one tab at a time; this is not shared or synchronized business data. The current order and selected role are intentionally reset on refresh. If browser storage is blocked, the demo remains usable for that visit and shows a warning.

Start at Point of Sale, add a product, charge the order, choose Exact amount, and complete the demo payment. Then explore Inventory, Reports, and Audit Trail. Use the profile/role button to try the cashier experience. Reset restores twelve products and 156 consistent sample transactions across roughly six months.

Role switching illustrates a workflow, not a security boundary. No sign-in, invitation email, real card charge, or live business data is involved. Sample receipts are explicitly marked as demo documents. Reset only changes local demo data.

## Optional Supabase foundation

The existing [client](./lib/supabase.ts), [schema sketch](./supabase/schema.sql), and CLI configuration are retained for future development. The showcase does not import the Supabase client, contact the database, or need environment variables to run.

Production integration remains: Auth sign-in and session handling, provisioning staff, server-backed queries, an authenticated atomic checkout RPC with stock locking and server-side pricing/tax, stock adjustment auditing, payment processor integration, and fiscal receipt requirements. Never enable direct sale inserts or trust client-side totals/roles. Create the first admin through a trusted database administrator. Use a separate project for staging; never connect demo data to a real store.
