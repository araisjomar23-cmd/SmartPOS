'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Package, X } from 'lucide-react';
import { Product, Store, photo } from '../lib/store';
export const stamp = (s: string) => new Date(s).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
export const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
export function download(name: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: `${type};charset=utf-8` }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function validStore(value: unknown): value is Store {
  const s = value as Store;
  const finite = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  return !!s && Array.isArray(s.products) && Array.isArray(s.sales) && Array.isArray(s.staff) && Array.isArray(s.audits)
    && s.staff.some(u => u.active && u.role === 'admin')
    && s.products.every(p => typeof p.id === 'string' && typeof p.name === 'string' && typeof p.sku === 'string' && typeof p.category === 'string' && finite(p.price) && Number.isSafeInteger(p.stock) && p.stock >= 0 && finite(p.low_stock) && typeof p.active === 'boolean')
    && s.staff.every(u => typeof u.id === 'string' && typeof u.full_name === 'string' && typeof u.email === 'string' && ['admin', 'cashier'].includes(u.role) && typeof u.active === 'boolean')
    && s.sales.every(v => typeof v.id === 'string' && Number.isFinite(Date.parse(v.created_at)) && typeof v.cashier_name === 'string' && ['Cash', 'Card'].includes(v.payment) && [v.subtotal, v.discount, v.tax, v.total, v.received, v.change].every(finite) && Array.isArray(v.items) && v.items.every(i => typeof i.product_id === 'string' && typeof i.name === 'string' && finite(i.price) && Number.isSafeInteger(i.quantity) && i.quantity > 0))
    && s.audits.every(a => typeof a.id === 'string' && typeof a.action === 'string' && typeof a.detail === 'string' && typeof a.actor_name === 'string' && Number.isFinite(Date.parse(a.created_at)));
}
export function ProductImage({ product, width = 400 }: { product: Product; width?: number }) {
  const [failed, setFailed] = useState(false);
  return <span className="product-visual">{product.image && !failed ? <img src={photo(product, width)} alt={product.name} loading="lazy" onError={() => setFailed(true)} /> : <Package size={32} aria-label={product.name} />}</span>;
}
export function Empty({ title, text }: { title: string; text: string }) { return <div className="empty"><Package size={28} /><h3>{title}</h3><p>{text}</p></div>; }
export function Dialog({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLElement>(null), closeRef = useRef(close); closeRef.current = close;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const before = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const node = ref.current;
    const focusable = () => Array.from(node?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea, [tabindex="0"]') || []).filter(el => el.getClientRects().length);
    (node?.querySelector<HTMLElement>('input, select') || focusable()[0])?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab') { const list = focusable(); const first = list[0], last = list[list.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = before; document.removeEventListener('keydown', key); previous?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}><section ref={ref} className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button className="modal-close" onClick={close} aria-label="Close dialog"><X size={20} /></button><h2 id="dialog-title">{title}</h2>{children}</section></div>;
}
