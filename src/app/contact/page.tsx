import type { Metadata } from 'next';
import { ContactView } from '@/components/site/ContactView';

export const metadata: Metadata = {
  title: 'Contact | Mehrdad — Product Builder',
  description: 'One clear path to start a conversation: AI/product solutions, projects, collaboration or connecting.',
  alternates: {
    canonical: '/contact',
    languages: { en: '/contact', fa: '/contact?lang=fa', 'x-default': '/contact' },
  },
};

export default function ContactPage() {
  return <ContactView />;
}
