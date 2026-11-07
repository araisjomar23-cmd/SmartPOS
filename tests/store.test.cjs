const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.join(__dirname, '../lib/store.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } });
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded._compile(compiled.outputText, filename);
const { totals, seedStore, money, inPeriod, csv, receiptText } = loaded.exports;

test('peso checkout rounds centavos and bounds a discount by the order value', () => {
  const items = [{ price: 85.25, quantity: 2 }, { price: 49.99, quantity: 1 }];
  assert.deepEqual(totals(items, 20), { subtotal: 220.49, discount: 20, tax: 0, total: 200.49 });
  assert.equal(totals(items, 999).total, 0);
  assert.equal(totals(items, -25).discount, 0);
  assert.equal(totals([], 25).total, 0);
  assert.match(money(1234.5), /₱1,234\.50/);
});

test('all sample receipts reconcile and leave valid inventory for exploration', () => {
  const store = seedStore();
  assert.equal(store.sales.length, 156);
  assert.equal(new Set(store.products.map(p => p.sku)).size, store.products.length);
  assert.ok(store.products.some(p => p.stock === 0));
  assert.ok(store.products.some(p => p.stock > 0 && p.stock <= p.low_stock));
  for (const s of store.sales) {
    const gross = s.items.reduce((n, i) => n + i.price * i.quantity, 0);
    assert.equal(s.subtotal, gross, s.id);
    assert.equal(s.total, s.subtotal - s.discount + s.tax, s.id);
    assert.equal(s.received - s.change, s.total, s.id);
    assert.ok(Date.parse(s.created_at) <= Date.now());
  }
});

test('daily and monthly filters respect year and day boundaries', () => {
  const sale = { created_at: new Date(2025, 10, 7, 12).toISOString() };
  assert.equal(inPeriod(sale, '2025-11', 'Monthly'), true);
  assert.equal(inPeriod(sale, '2026-11', 'Monthly'), false);
  assert.equal(inPeriod(sale, '2025-11-07', 'Daily'), true);
  assert.equal(inPeriod(sale, '2025-11-08', 'Daily'), false);
  const jan = { created_at: new Date(2026, 0, 1, 0, 1).toISOString() };
  assert.equal(inPeriod(jan, '2025-12', 'Monthly'), false);
  assert.equal(inPeriod(jan, '2026-01', 'Monthly'), true);
});

test('exports preserve peso receipts, quote CSV fields and neutralize formulas', () => {
  const s = seedStore().sales[0];
  s.cashier_name = '=HYPERLINK("bad")';
  const text = csv([s]);
  assert.match(text, /Total \(PHP\)/);
  assert.equal(text.split('\r\n').length, 2);
  assert.ok(text.includes('"\'=HYPERLINK(""bad"")"'));
  const receipt = receiptText(s, true);
  assert.ok(receipt.includes(money(s.total)));
  assert.ok(receipt.includes('Currency: PHP'));
  assert.ok(receipt.includes('DEMO RECEIPT'));
  assert.ok(!receipt.includes('$'));
});
