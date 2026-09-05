import type { Metadata } from 'next';
import { AdminView } from '@/components/site/AdminView';

// the admin panel is private — keep it out of search indexes
export const metadata: Metadata = {
  title: 'Admin | Mehrdad',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminView />;
}
