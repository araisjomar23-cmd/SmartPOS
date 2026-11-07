import './globals.css';
import './polish.css';
export const metadata = { title: 'SmartPOS', description: 'Explore a working retail demo in Philippine pesos. Sales, inventory, receipts, reports and team role previews, all in one place.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
