export type Role = 'admin' | 'cashier';
export type Product = { id: string; sku: string; name: string; category: string; price: number; stock: number; low_stock: number; image: string; active: boolean; unit?: string };
export type Staff = { id: string; full_name: string; email: string; role: Role; active: boolean };
export type Line = { product_id: string; name: string; sku: string; price: number; quantity: number };
export type Sale = { id: string; created_at: string; cashier_id: string; cashier_name: string; items: Line[]; subtotal: number; discount: number; tax: number; total: number; payment: 'Cash' | 'Card'; received: number; change: number };
export type Audit = { id: string; created_at: string; actor_name: string; action: string; detail: string };
export type Store = { products: Product[]; sales: Sale[]; staff: Staff[]; audits: Audit[] };
export const categories = ['Produce', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Pantry', 'Other'];
export const money = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);
export const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const totals = (items: Line[], discount: number) => {
  const subtotal = round(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const applied = round(Math.min(subtotal, Math.max(0, discount)));
  // The showcase store has no additional tax. No Philippine tax rules are implied.
  const tax = 0;
  return { subtotal, discount: applied, tax, total: round(subtotal - applied + tax) };
};
export const emptyStore = (): Store => ({ products: [], sales: [], staff: [], audits: [] });
export const photo = (p: Pick<Product, 'image'>, width = 400) => p.image ? `https://images.unsplash.com/${p.image}?auto=format&fit=crop&w=${width}&q=80` : '';
export function seedStore(): Store {
  const rows: [string, string, number, number, string][] = [
    ['Organic Bananas', 'Produce', 85, 48, 'photo-1603833665858-e61d17a86224'],
    ['Red Apples', 'Produce', 120, 36, 'photo-1560806887-1e4cd0b6cbd6'],
    ['Fresh Avocado', 'Produce', 95, 24, 'photo-1523049673857-eb18f1d7b578'],
    ['Whole Milk', 'Dairy & Eggs', 110, 32, 'photo-1563636619-e9143da7973b'],
    ['Sourdough Bread', 'Bakery', 180, 18, 'photo-1509440159596-0249088772ff'],
    ['Free-range Eggs', 'Dairy & Eggs', 145, 8, 'photo-1506976785307-8732e854ad03'],
    ['Orange Juice', 'Beverages', 99, 27, 'photo-1613478223719-2ab802602423'],
    ['Ground Coffee', 'Beverages', 350, 15, 'photo-1559525839-b184a4d698c7'],
    ['Fresh Strawberries', 'Produce', 225, 6, 'photo-1464965911861-746a04b4bca6'],
    ['Butter Croissant', 'Bakery', 75, 21, 'photo-1555507036-ab1f4038808a'],
    ['Greek Yogurt', 'Dairy & Eggs', 89, 19, 'photo-1488477181946-6428a0291777'],
    ['Sparkling Water', 'Beverages', 45, 0, 'photo-1603394630850-69b3ca8121ca'],
  ];
  const products = rows.map(([name, category, price, stock, image], i) => ({ id: `demo-${i + 1}`, sku: `SKU-${String(i + 1).padStart(4, '0')}`, name, category, price, stock, low_stock: 10, image, active: true, unit: i < 2 ? 'kg' : i === 5 ? 'dozen' : 'unit' }));
  const staff: Staff[] = [{ id: 'demo-admin', full_name: 'Alex Morgan', email: 'alex@greenfield.demo', role: 'admin', active: true }, { id: 'demo-cashier', full_name: 'Jamie Rivera', email: 'jamie@greenfield.demo', role: 'cashier', active: true }];
  const sales: Sale[] = Array.from({ length: 156 }, (_, i): Sale => {
    const date = new Date(); date.setDate(date.getDate() - (i < 12 ? Math.floor(i / 4) : Math.floor((i - 10) * 1.12))); date.setHours(9 + i % 9, i * 7 % 60, 0, 0);
    if (date > new Date()) date.setTime(Date.now() - i * 60000);
    const items = [products[i % 12], products[(i + 4) % 12]].map((p, j) => ({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, quantity: (i + j) % 3 + 1 }));
    const amount = totals(items, i % 8 === 0 ? 25 : 0);
    return { id: `DEMO-${String(1200 + i)}`, created_at: date.toISOString(), cashier_id: staff[i % 2].id, cashier_name: staff[i % 2].full_name, items, ...amount, payment: i % 2 ? 'Cash' : 'Card', received: amount.total, change: 0 };
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const audits: Audit[] = sales.slice(0, 12).map(s => ({ id: `audit-${s.id}`, created_at: s.created_at, actor_name: s.cashier_name, action: 'Sale completed', detail: `${s.id} · ${money(s.total)} · ${s.items.reduce((n, i) => n + i.quantity, 0)} items · ${s.payment} (sample)` }));
  audits.unshift({ id: 'seed', created_at: new Date().toISOString(), actor_name: 'SmartPOS', action: 'Demo initialized', detail: 'Sample products and 156 sample transactions loaded. No real business data.' });
  return { products, staff, sales, audits };
}
export function inPeriod(sale: Sale, date: string, period: string) {
  const d = new Date(sale.created_at);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${period === 'Daily' ? `-${String(d.getDate()).padStart(2, '0')}` : ''}`;
  return key === date;
}
export function dateKey(d = new Date(), monthly = false) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${monthly ? '' : `-${String(d.getDate()).padStart(2, '0')}`}`;
}
export function csv(sales: Sale[]) {
  const cell = (s: unknown) => `"${String(s).replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`;
  return [['Receipt', 'Date', 'Cashier', 'Payment', 'Subtotal (PHP)', 'Discount (PHP)', 'Tax (PHP)', 'Total (PHP)'], ...sales.map(s => [s.id, s.created_at, s.cashier_name, s.payment, s.subtotal.toFixed(2), s.discount.toFixed(2), s.tax.toFixed(2), s.total.toFixed(2)])].map(row => row.map(cell).join(',')).join('\r\n');
}
export function receiptText(s: Sale, demo: boolean) {
  return `GREENFIELD MARKET\n${demo ? 'DEMO RECEIPT · NOT VALID FOR TAX PURPOSES' : 'SALES RECEIPT'}\nCurrency: PHP\n${s.id}\n${new Date(s.created_at).toLocaleString('en-PH')}\nCashier: ${s.cashier_name}\n\n${s.items.map(i => `${i.quantity} x ${i.name} @ ${money(i.price)}  ${money(i.price * i.quantity)}`).join('\n')}\n\nSubtotal: ${money(s.subtotal)}\nDiscount: ${money(s.discount)}\nAdditional tax: ${money(s.tax)}\nTotal: ${money(s.total)}\nPayment: ${s.payment}\nTendered: ${money(s.received)}\nChange: ${money(s.change)}\n\n${demo ? 'Sample transaction. No payment processed.' : 'Thank you for shopping local.'}`;
}
